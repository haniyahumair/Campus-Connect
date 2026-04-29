import { supabase } from "../config/supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-reset-btn");
  const updateBtn = document.getElementById("update-password-btn");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");

sendBtn?.addEventListener("click", async () => {
  const email = document.getElementById("reset-email").value.trim();

  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  sendBtn.value = "Sending...";
  sendBtn.disabled = true;

  const redirectTo =
    window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:5502/pages/reset-password.html"
      : "https://qc-3002-campus-connect.vercel.app/pages/reset-password.html";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    alert("Error: " + error.message);
    sendBtn.value = "Send Reset Email";
    sendBtn.disabled = false;
    return;
  }

  alert("Reset email sent! Check your inbox and click the link.");
  sendBtn.value = "Email Sent!";
});

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    // show step 2, hide step 1
    step1.style.display = "none";
    step2.style.display = "block";
  }
});

updateBtn?.addEventListener("click", async () => {
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

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

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    alert("Error: " + error.message);
    updateBtn.value = "Reset Password";
    updateBtn.disabled = false;
    return;
  }

  alert("Password updated successfully!");
  window.location.href = "/pages/login.html";
});
