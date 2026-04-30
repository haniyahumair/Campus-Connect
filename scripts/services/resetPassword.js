import { supabase } from "../config/supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-reset-btn");
  const updateBtn = document.getElementById("update-password-btn");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");

  sendBtn?.addEventListener("click", async () => {
    const emailEl = document.getElementById("reset-email");
    const email = emailEl ? emailEl.value.trim() : "";

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    sendBtn.value = "Sending...";
    sendBtn.disabled = true;

    const redirectTo = "https://qc-3002-campus-connect.vercel.app/pages/reset-password.html";
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        alert("Error: " + (error.message || error));
        sendBtn.value = "Send Reset Email";
        sendBtn.disabled = false;
        return;
      }

      alert("Reset email sent! Check your inbox and click the link.");
      sendBtn.value = "Email Sent!";
    } catch (err) {
      console.error("Reset password error:", err);
      alert("Error: " + (err.message || err));
      sendBtn.value = "Send Reset Email";
      sendBtn.disabled = false;
    }
  });

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      if (step1) step1.style.display = "none";
      if (step2) step2.style.display = "block";
    }
  });

  updateBtn?.addEventListener("click", async () => {
    const newPasswordEl = document.getElementById("new-password");
    const confirmPasswordEl = document.getElementById("confirm-password");
    const newPassword = newPasswordEl ? newPasswordEl.value : "";
    const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : "";

    if (!newPassword || !confirmPassword) {
      alert("Please fill in both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    updateBtn.value = "Updating...";
    updateBtn.disabled = true;

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        alert("Error: " + (error.message || error));
        updateBtn.value = "Reset Password";
        updateBtn.disabled = false;
        return;
      }

      alert("Password updated successfully!");
      window.location.href = "/pages/login.html";
    } catch (err) {
      console.error("Update password error:", err);
      alert("Error: " + (err.message || err));
      updateBtn.value = "Reset Password";
      updateBtn.disabled = false;
    }
  });
});
