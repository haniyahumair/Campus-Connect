import { supabase } from "../config/supabase.js";
import { showModal } from "../utils/modal.js";

const form = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  //qu.edu.qa 
  //abdn.ac.uk
  //oryx.edu.qa
  //udst.edu.qa
  //qatar.cmu.edu
  // qatar-med.cornell.edu or cornell.edu
  //u.northwestern.edu or qatar.northwestern.edu
  //georgetown.edu
  //vcu.edu
  //hbku.edu.qa

  if (email.endsWith("@qu.edu.qa") || email.endsWith("@abdn.ac.uk") || email.endsWith("@oryx.edu.qa") || email.endsWith("@udst.edu.qa") || email.endsWith("@qatar.cmu.edu") || email.endsWith("@qatar-med.cornell.edu") || email.endsWith("@cornell.edu") || email.endsWith("@u.northwestern.edu") || email.endsWith("@qatar.northwestern.edu") || email.endsWith("@georgetown.edu") || email.endsWith("@vcu.edu") || email.endsWith("@hbku.edu.qa")) {
    // Valid email domain
  } else {
    showModal("Error", "Please use a university email to login in!", "error", {
      autoClose: 3000,
      onClose: () => {
        window.location.href = "/pages/login.html";
      },
    });
    return;
  }

  try {
    console.log("Attempting login for:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Add this check ↓
    if (!data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      return;
    }

    // Fetch role from database — don't trust the radio button
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) throw profileError;

    const role = profile?.role;
    console.log("Role from DB:", role);

    if (role === "admin") {
      showModal(
        "Welcome back, Admin!",
        "You can now manage events and view stats!",
        "success",
        {
          autoClose: 3000,
          onClose: () => {
            window.location.href = "/admin/index.html";
          },
        }
      );
    } else {
      showModal(
        "Welcome back to Campus Connect!",
        "Start exploring to find more events!",
        "success",
        {
          autoClose: 3000,
          onClose: () => {
            window.location.href = "/pages/profile.html";
          },
        }
      );
    }
  } catch (error) {
    console.error("Login error:", error.message);
    showModal("Login failed", `{error.message}`, "error", {
      autoClose: 3000,
      onClose: () => {
        window.location.href = "/pages/login.html";
      },
    });
  }
});
