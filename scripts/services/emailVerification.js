import { supabase } from "../config/supabase.js";

supabase.auth.onAuthStateChange((event, session) => {
  const msg = document.getElementById("message");

  if (
    event === "USER_UPDATED" ||
    (event === "SIGNED_IN" && session?.user?.email_confirmed_at)
  ) {
    msg.textContent = "Email verified! Redirecting...";
    setTimeout(() => (window.location.href = "/index.html"), 2000);
  } else if (event === "SIGNED_IN" && !session?.user?.email_confirmed_at) {
    msg.textContent = "Verification failed or link expired. Please try again.";
  }
});
