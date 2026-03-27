import { supabase } from "../config/supabase.js";
import { initNotifications } from "./notifications.js";


async function checkLoginStatus() {
  // retrieve user status from login/signup
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isLoggedIn = Boolean(session);

  // test login and user data retrieval
  console.log("logged in", isLoggedIn);
  console.log("User:", session?.user?.email);

  // UI elements to be shown based on whether the user is logged in or not
  const profileIcon = document.getElementById("profileIcon");
  const cartIcon = document.getElementById("cartIcon");
  const loginBtn = document.getElementById("loginBtn");
  const signOutBtn = document.getElementById("signOutBtn");

  // navigation bar visibility logic
  if (isLoggedIn) {
    /*testing*/ console.log(
      "User is logged in, showing profile and cart icons."
    );
    if (profileIcon) profileIcon.style.display = "inline-block";
    if (cartIcon) cartIcon.style.display = "inline-block";
    if (loginBtn) loginBtn.style.display = "none";
    if (signOutBtn) signOutBtn.style.display = "inline-block";
    await initNotifications(); // initialize notifications only when user is logged in
  } else {
    /*testing*/ console.log(
      "User is not logged in, hiding profile and cart icons."
    );
    if (profileIcon) profileIcon.style.display = "none";
    if (cartIcon) cartIcon.style.display = "none";
    if (signOutBtn) signOutBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "inline-block";
  }

  // fetch data straight from supabase profile table
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name", "avatar_url", "is_admin")
    .eq("id", session.user.id)
    .single();

    //if user is admin, redir
    if (profile?.is_admin) {
      console.log("User is admin, redirecting to admin dashboard.");
      window.location.href = "/admin/index.html";
      return;
    }

    const avatarImg = document.getElementById("userAvatar");
    if (avatarImg) {
      if (profile?.avatar_url) {
        avatarImg.src = profile.avatar_url;
      } else {
        const name = profile?.full_name || "User";
        avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ff8b80&color=fff&rounded=true&size=35`;
      }
      avatarImg.style.display = "block";
    }

  const viewDetailsBtn = document.querySelectorAll(".viewDetailBtn");
  const createEventBtn = document.querySelectorAll(".createEvent");

  if (viewDetailsBtn.length > 0) {
    viewDetailsBtn.forEach((btn) => {
      btn.style.cursor = "pointer";
      const eventId = btn.dataset.id;
      btn.addEventListener("click", () => {
        if (isLoggedIn) {
          window.location.href = `details.html?id=${eventId}`;
        } else {
          window.location.href = "/pages/login.html";
        }
      });
    });
  }

  if (createEventBtn.length > 0) {
    createEventBtn.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (isLoggedIn) {
          window.location.href = "/pages/create.html";
        } else {
          window.location.href = "/pages/login.html";
        }
      });
    });

    // view database on web console
    console.log("User is logged in:", isLoggedIn);
  }
}
// run logic after loading
document.addEventListener("DOMContentLoaded", checkLoginStatus);
