import { supabase } from "../config/supabase.js";
import { showModal } from "../utils/modal.js";

async function uploadAvatar(file) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    console.log("Uploading file:", fileName);

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    console.log("Upload result:", data, error);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    console.log("Public URL:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Avatar upload error:", error);
    return null;
  }
}

function setupForm() {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedRole = document.querySelector('input[name="role"]:checked').value;
    if (!roleInput) {
      alert("Please select a role.");
      return;
    }
    const selectedRole = roleInput.value
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
      alert("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    // grab avatar file early so we have it later
    const avatarFile =
      selectedRole === "student"
        ? document.getElementById("avatar").files[0]
        : null;

    let userData = {
      full_name: name,
      role: selectedRole,
      is_admin: selectedRole === "admin",
      admin_approved: false,
    };

    if (selectedRole === "student") {
      const studentId = document.getElementById("student_id").value.trim();
      const university = document.getElementById("university").value.trim();
      const major = document.getElementById("major").value.trim();
      const yearOfStudy = document.getElementById("year_of_study").value;
      const bio = document.getElementById("bio").value.trim();

      if (!studentId) {
        alert("Please enter your Student ID");
        return;
      }
      if (!university) {
        alert("Please enter your university");
        return;
      }
      if (!major) {
        alert("Please enter your major");
        return;
      }
      if (!yearOfStudy) {
        alert("Please select your year of study");
        return;
      }

      userData.student_id = studentId;
      userData.university = university;
      userData.major = major;
      userData.year_of_study = parseInt(yearOfStudy);
      if (bio) userData.bio = bio;
      // avatar_url will be set after signup
    } else {
      const department = document.getElementById("department").value.trim();
      const adminBio = document.getElementById("admin_bio").value.trim();

      if (!department) {
        alert("Please enter your department/organization");
        return;
      }

      userData.department = department;
      if (adminBio) userData.bio = adminBio;
    }

    const submitBtn = form.querySelector(".btn-submit");
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Creating Account...";

    try {
      console.log("Starting signup...", userData);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            window.location.hostname === "127.0.0.1"
              ? "http://127.0.0.1:5502/pages/email-verification.html"
              : "https://qc-3002-campus-connect.vercel.app/pages/email-verification.html",
        },
      });

      console.log("Auth response:", authData, authError);
      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from signup");

      console.log("User created:", authData.user.id);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("Session after signup:", session);

      let avatarUrl = "/assets/Icons/user-Icon.svg";
      if (avatarFile && session) {
        const uploaded = await uploadAvatar(avatarFile);
        if (uploaded) avatarUrl = uploaded;
      } else if (avatarFile && !session) {
        console.log("No session yet, skipping avatar upload");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: authData.user.id,
            email,
            ...userData,
            avatar_url: avatarUrl,
          },
        ])
        .select();

      console.log("Profile response:", profileData, profileError);
      if (profileError) throw profileError;

      submitBtn.textContent = "Account Created!";

      const title =
        selectedRole === "admin"
          ? "Admin Account Created!"
          : "Welcome to Campus Connect!";
      const message =
        selectedRole === "admin"
          ? "Your admin account has been created. Please check your email to verify your account before logging in."
          : "Your account has been created! Please check your email and click the verification link before logging in.";

      showModal(title, message, "success", {
        autoClose: 6000,
        onClose: () => {
          window.location.href = "/pages/login.html";
        },
      });
    } catch (error) {
      console.error("Signup error:", error);

      let errorMessage = "Failed to create account. ";

      if (
        error.message.includes("already registered") ||
        error.message.includes("already been registered")
      ) {
        errorMessage =
          "This email is already registered. Please login instead.";
      } else if (error.message.includes("duplicate key")) {
        errorMessage = error.message.includes("student_id")
          ? "This Student ID is already registered."
          : "This email is already registered.";
      } else if (error.message.includes("invalid email")) {
        errorMessage = "Please enter a valid email address.";
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);

      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupForm();
});
