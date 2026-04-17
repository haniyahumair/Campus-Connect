import { supabase } from "../config/supabase.js";
import { createNavbar } from "../components/navbarComponent.js";
import { createFooter } from "../components/footerComponent.js";
import { createEventCard } from "../components/eventCardsComponents.js";
import { showModal } from "../utils/modal.js";
import { getWishlist, toggleWishlist } from "../services/wishlist.js";

document.querySelector("header").innerHTML = createNavbar();
document.querySelector("footer").innerHTML = createFooter();

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadCreatedEvents();
  loadUpcomingEvents();
  loadSavedEvents();
});

async function attachWishlistHandlers(container, user, savedEventIds, onToggle) {
  container.querySelectorAll(".event-card").forEach(card => {
    const eventId = card.querySelector(".viewDetailBtn").dataset.id;
    const heartIcon = card.querySelector(".save-event img");

    if (savedEventIds.has(String(eventId))) {
      heartIcon.src = "/assets/Icons/Heart filled peach.svg";
    }

    card.querySelector(".save-event").addEventListener("click", async (e) => {
      e.stopPropagation();
      console.log(`Save button clicked — event ID: ${eventId}, user: ${user?.id ?? "not logged in"}`);
      await toggleWishlist(user, eventId, heartIcon);
      console.log(`toggleWishlist completed for event ID: ${eventId}`);
      if (onToggle) onToggle();
    });
  });
}

async function loadUserProfile() {
  showModal("Loading...", "Please wait while we load your profile.", "loading", {
    showButton: false,
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    alert("You must be logged in to view your profile.");
    window.location.href = "/pages/login.html";
    return;
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    if (profile?.is_admin) {
      window.location.href = "/admin/index.html";
      return;
    }

    document.getElementById("profileName").textContent = profile.full_name;
    document.getElementById("profileEmail").textContent = profile.email;
    document.getElementById("profileRole").textContent = `🎓 ${profile.role}`;
    document.getElementById("university").textContent = `🏫 ${profile.university}`;
    document.getElementById("studentId").textContent = `🆔 ${profile.student_id}`;
    document.getElementById("major").textContent = `📚 ${profile.major}`;
    document.getElementById("yearOfStudy").textContent = `📅 Year ${profile.year_of_study}`;
    document.getElementById("bioText").textContent = profile.bio || "No bio available.";

    const avatar = document.getElementById("profileAvatar");
    avatar.src = profile.avatar_url || "/assets/Icons/userIcon.svg";
    avatar.onerror = () => { avatar.src = "/assets/Icons/userIcon.svg"; };

    closeModal();
    document.getElementById("profileContent").style.display = "block";

  } catch (error) {
    console.error("Error loading profile:", error);
    alert("Failed to load profile. Please try again later.");
  }


}
function truncateBySentences(text, maxSentences = 1) {
  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const truncated = sentences.slice(0, maxSentences).join('').trim();
  return sentences.length > maxSentences ? truncated.replace(/\s+$/,'') + '…' : truncated;
}

async function loadCreatedEvents() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("org_id", user.id);
    console.log("Fetched events:", events);
    console.log("Logged-in user ID:", user.id);

  const container = document.getElementById("createdEventsContainer");

  if (error || !events || events.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align:center;padding:40px;background:#f9f9f9;border-radius:8px;display:flex;flex-direction:column;align-items:center;font-family:'Inter',sans-serif;">
        <h3>Nothing to see here!</h3>
        <p style="font-size:0.875rem; font-family: var(--text-font);">You haven't created any events yet.</p>
        <a href="/pages/create.html" style="text-decoration:none;color:black;margin-top:15px;border:2px solid #FF8A80;padding:12px 15px;border-radius:35px;font-size:0.875rem">Create Events</a>
      </div>`;
    return;
  }

    if (events && events.length > 0) {
    // Filter events with status "pending"
    const pendingEvents = events.filter(event => event.event_status === "pending");
    const approvedEvents = events.filter(event => event.event_status === "approved");
    const rejectedEvents = events.filter(event => event.event_status === "rejected");

    document.getElementById("createdCount").textContent = events.length;
    container.innerHTML = "";

    if (pendingEvents.length > 0) {
      container.innerHTML += "<h3 style='grid-column: 1 / -1; font-family: var(--subheader-font); font-size: 1.5rem;'>Your pending events:</h3>";
      pendingEvents.forEach((event) => {
        const date = new Date(event.date);
        if (event.price === 0) event.price = "Free";

        const mappedEvent = {
          id: event.id,
          title: event.title,
          description: truncateBySentences(event.description, 1),
          location: event.location,
          price: event.price === "Free" ? "Free" : `${event.price} QAR`,
          image: event.img_url ?? event.image ?? "/assets/default-event.jpg",
          month: date.toLocaleString("default", { month: "long" }),
          day: date.getDate(),
          year: date.getFullYear(),
          start: event.start_time ?? event.start,
          end: event.end_time ?? event.end,
          attendees: event.current_registration ?? 0,
          capacity: event.max_capacity ?? 100,
          type: event.category ?? event.type,
          saveEvent: "/assets/Icons/Heart outline peach.svg",
        };
        const eventElement = document.createElement("div");
        eventElement.classList.add("pending-event");
        eventElement.innerHTML = createEventCard(mappedEvent);
        container.appendChild(eventElement);
      });
    }

    if (approvedEvents.length > 0) {
      container.innerHTML += "<h3 style='; grid-column: 1 / -1; font-family: var(--subheader-font); font-size: 1.5rem;'>Your created events:</h3>";
      approvedEvents.forEach((event) => {
        const date = new Date(event.date);
        if (event.price === 0) event.price = "Free";
        const mappedEvent = {
          id: event.id,
          title: event.title,
          description: truncateBySentences(event.description, 1),
          location: event.location,
          price: event.price === "Free" ? "Free" : `${event.price} QAR`,
          image: event.img_url ?? event.image ?? "/assets/default-event.jpg",
          month: date.toLocaleString("default", { month: "long" }),
          day: date.getDate(),
          year: date.getFullYear(),
          start: event.start_time ?? event.start,
          end: event.end_time ?? event.end,
          attendees: event.current_registration ?? 0,
          capacity: event.max_capacity ?? 100,
          type: event.category ?? event.type,
          saveEvent: "/assets/Icons/Heart outline peach.svg",
        };
        container.innerHTML += createEventCard(mappedEvent);
      });
    }
    if (rejectedEvents.length > 0) {
      container.innerHTML += "<h3 style='; grid-column: 1 / -1; font-family: var(--subheader-font); font-size: 1.5rem;'>Rejected events:</h3>";
      rejectedEvents.forEach((event) => {
        const date = new Date(event.date);
        if (event.price === 0) event.price = "Free";
        const mappedEvent = {
          id: event.id,
          title: event.title,
          description: truncateBySentences(event.description, 1),
          location: event.location,
          price: event.price === "Free" ? "Free" : `${event.price} QAR`,
          image: event.img_url ?? event.image ?? "/assets/default-event.jpg",
          month: date.toLocaleString("default", { month: "long" }),
          day: date.getDate(),
          year: date.getFullYear(),
          start: event.start_time ?? event.start,
          end: event.end_time ?? event.end,
          attendees: event.current_registration ?? 0,
          capacity: event.max_capacity ?? 100,
          type: event.category ?? event.type,
          saveEvent: "/assets/Icons/Heart outline peach.svg",
        };
        const eventElement = document.createElement("div");
        eventElement.classList.add("rejected-event");
        eventElement.innerHTML = createEventCard(mappedEvent);
        container.appendChild(eventElement);
      });
    }
  }

  const savedEvents = await getWishlist(user);
  const savedEventIds = new Set(savedEvents.map(s => String(s.event_id)));
  await attachWishlistHandlers(container, user, savedEventIds);
}

async function loadUpcomingEvents() {
  const container = document.getElementById("upcomingEventsContainer");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/pages/login.html';
    return;
  }
  const { data: registrations, error } = await supabase
    .from("registration")
    .select("*, events(*)")
    .eq("user_id", user.id)
    .eq("status", "registered");

  if (error || !registrations || registrations.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align:center;padding:40px;background:#f9f9f9;border-radius:8px;display:flex;flex-direction:column;align-items:center;font-family:'Inter',sans-serif;">
        <h3>Nothing to see here!</h3>
        <p style="font-size:0.875rem; font-family: var(--text-font);; ">You haven't registered for any events yet.</p>
        <a href="/pages/events.html" style="text-decoration:none;color:black;margin-top:15px;border:2px solid #FF8A80;padding:12px 15px;border-radius:35px;font-size:0.875rem">Browse Events</a>
      </div>`;
    return;
  }

  document.getElementById("upcomingCount").textContent = registrations.length;
  container.innerHTML = "";
  registrations.forEach((reg) => {
    const event = reg.events;
    const date = new Date(event.date);
    if (event.price === 0){
      event.price = "Free";
    }
    const mappedEvent = {
      id: event.id,
      title: event.title,
      description: truncateBySentences(event.description, 1),
      location: event.location,
      price: event.price === "Free" ? "Free" : `${event.price} QAR`,
      image: event.img_url ?? event.image ?? "/assets/default-event.jpg",
      month: date.toLocaleString("default", { month: "long" }),
      day: date.getDate(),
      year: date.getFullYear(),
      start: event.start_time ?? event.start,
      end: event.end_time ?? event.end,
      attendees: event.current_registration ?? 0,
      capacity: event.max_capacity ?? 100,
      type: event.category ?? event.type,
      saveEvent: "/assets/Icons/Heart outline peach.svg",
    };
    container.innerHTML += createEventCard(mappedEvent);
  });

  const savedEvents = await getWishlist(user);
  const savedEventIds = new Set(savedEvents.map(s => String(s.event_id)));
  await attachWishlistHandlers(container, user, savedEventIds);
}

async function loadSavedEvents() {
  const container = document.getElementById("savedEventsContainer");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/pages/login.html';
    return;
  }
  const { data: saved, error } = await supabase
    .from("wishlist")
    .select("*, events(*)")
    .eq("user_id", user.id);

  if (error || !saved || saved.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align:center;padding:40px;background:#f9f9f9;border-radius:8px;display:flex;flex-direction:column;align-items:center;font-family:'Inter',sans-serif;">
        <h3>No saved events yet!</h3>
        <p style="font-size:0.875rem; font-family: var(--text-font);">Browse events and hit the heart to save them here.</p>
        <a href="/pages/events.html" style="text-decoration:none;color:black;margin-top:15px;border:2px solid #FF8A80;padding:12px 15px;border-radius:35px;font-size:0.875rem font-family:'Inter',sans-serif">Browse Events</a>
      </div>`;
    return;
  }

  document.getElementById("savedCount").textContent = saved.length;
  container.innerHTML = "";
  saved.forEach((row) => {
    const event = row.events;
    const date = new Date(event.date);
    if (event.price === 0){
      event.price = "Free";
    }
    const mappedEvent = {
      id: event.id,
      title: event.title,
      description: truncateBySentences(event.description, 1),
      location: event.location,
      price: event.price === "Free" ? "Free" : `${event.price} QAR`,
      image: event.img_url ?? event.image ?? "/assets/default-event.jpg",
      month: date.toLocaleString("default", { month: "long" }),
      day: date.getDate(),
      year: date.getFullYear(),
      start: event.start_time ?? event.start,
      end: event.end_time ?? event.end,
      attendees: event.current_registration ?? 0,
      capacity: event.max_capacity ?? 100,
      type: event.category ?? event.type,
      saveEvent: "/assets/Icons/Heart filled peach.svg",
    };
    container.innerHTML += createEventCard(mappedEvent);
  });

  // All events here are already saved — mark all as filled and reload tab on un-heart
  const savedEventIds = new Set(saved.map(s => String(s.event_id)));
  await attachWishlistHandlers(container, user, savedEventIds, () => loadSavedEvents());
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("viewDetailBtn")) {
    const eventId = e.target.dataset.id;
    window.location.href = `/pages/details.html?id=${eventId}`;
  }
});

document.getElementById("signOutBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = "/pages/login.html";
  } catch (error) {
    console.error("Sign out error:", error);
    alert("Failed to sign out. Please try again.");
  }
});

window.switchTab = function(tab, el) {
  document.querySelectorAll(".events-tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  el.classList.add("active");
  document.getElementById(`tab-${tab}`).classList.add("active");
}
