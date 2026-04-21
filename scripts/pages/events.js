import { createNavbar } from "../components/navbarComponent.js";
import { createFooter } from "../components/footerComponent.js";
import { supabase } from "../config/supabase.js";
import { createEventCard } from "../components/eventCardsComponents.js";
import { getWishlist, toggleWishlist } from "../services/wishlist.js";

document.querySelector("header").innerHTML = createNavbar();
document.querySelector("footer").innerHTML = createFooter();

const categoriesBtn = document.getElementById("categoriesBtn");
const priceBtn = document.getElementById("priceBtn");
const categoriesDropdown = document.getElementById("categoriesDropdown");
const priceDropdown = document.getElementById("priceDropdown");
const dateDropdown = document.getElementById("dateDropdown");
const dateBtn = document.getElementById("dateBtn");

let eventCardsArray = [];

// load events from Supabase
async function loadEvents() {
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_status", "approved");

  console.log("Events data:", events);
  console.log("Error:", error);

  if (error) {
    console.error("Error loading events:", error);
    return;
  }

  const container = document.getElementById("eventCardsContainer");
  container.innerHTML = "";

  events.forEach((event) => {
    const date = new Date(event.date);
    if (event.price === 0) {
      event.price = "Free";
    }

    function truncateBySentences(text, maxSentences = 1) {
      if (!text) return "";
      const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
      const truncated = sentences.slice(0, maxSentences).join("").trim();
      return sentences.length > maxSentences
        ? truncated.replace(/\s+$/, "") + "…"
        : truncated;
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

    //display event grid based on date (soonest events first)
    const cards = Array.from(container.querySelectorAll(".event-card"));
    cards.sort((a, b) => {
      const dateA = new Date(
        a.querySelector(".month").textContent +
          " " +
          a.querySelector(".day").textContent +
          ", " +
          a.querySelector(".year").textContent
      );
      const dateB = new Date(
        b.querySelector(".month").textContent +
          " " +
          b.querySelector(".day").textContent +
          ", " +
          b.querySelector(".year").textContent
      );
      return dateA - dateB;
    });
    cards.forEach((card) => container.appendChild(card));
  });

  //if events date has past the current date, hide the event card
  const currentDate = new Date();

  if (events) {
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      if (eventDate < currentDate) {
        const card = container
          .querySelector(`.event-card .viewDetailBtn[data-id="${event.id}"]`)
          .closest(".event-card");
        if (card) {
          card.style.display = "none";
        }
      }
    });
  }

  eventCardsArray = document.querySelectorAll(".event-card");

  // Wishlist: mark saved events and attach toggle handlers
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const savedEvents = await getWishlist(user);
    const savedEventIds = new Set(savedEvents.map((s) => String(s.event_id)));
    console.log("Wishlist loaded. Saved event IDs:", [...savedEventIds]);

    eventCardsArray.forEach((card) => {
      const eventId = card.querySelector(".viewDetailBtn").dataset.id;
      const heartIcon = card.querySelector(".save-event img");
      if (savedEventIds.has(String(eventId))) {
        heartIcon.src = "/assets/Icons/Heart filled peach.svg";
        console.log(`Event ${eventId} is in wishlist — heart filled`);
      }
    });
  } else {
    console.log("No user logged in — skipping wishlist pre-fill");
  }

  document.querySelectorAll(".save-event").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const card = btn.closest(".event-card");
      const eventId = card.querySelector(".viewDetailBtn").dataset.id;
      const heartIcon = btn.querySelector("img");
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      console.log(
        `Save button clicked — event ID: ${eventId}, user: ${
          currentUser?.id ?? "not logged in"
        }`
      );
      await toggleWishlist(currentUser, eventId, heartIcon);
      console.log(`toggleWishlist completed for event ID: ${eventId}`);
    });
  });

  // view event details
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("viewDetailBtn")) {
      const eventId = e.target.dataset.id;
      window.location.href = `/pages/details.html?id=${eventId}`;
    }
  });
}
// Toggle Dropdowns
function toggleDropdown(button, dropdown) {
  const isVisible = dropdown.classList.contains("show");
  document
    .querySelectorAll(".dropdown-menu-custom")
    .forEach((menu) => menu.classList.remove("show"));
  if (!isVisible) {
    dropdown.classList.add("show");
  }
}

categoriesBtn.addEventListener("click", () =>
  toggleDropdown(categoriesBtn, categoriesDropdown)
);
priceBtn.addEventListener("click", () =>
  toggleDropdown(priceBtn, priceDropdown)
);
dateBtn.addEventListener("click", () => toggleDropdown(dateBtn, dateDropdown));

// category filter
if (categoriesDropdown) {
  const categoryType = categoriesDropdown.querySelectorAll("div");
  categoryType.forEach((option) => {
    option.addEventListener("click", () => {
      const selectedItem = option.textContent.trim();
      categoriesBtn.textContent = selectedItem;

      eventCardsArray.forEach((card) => {
        const eventTypeBtn = card.querySelector(".event-type");
        const eventType = eventTypeBtn.textContent.trim();

        card.classList.remove("hidden");
        if (eventType !== selectedItem) {
          card.classList.add("hidden");
        }

        // Show all events if "All Events" is selected
        if (selectedItem === "All Events") {
          card.classList.remove("hidden");
        }
      });
      categoriesDropdown.classList.remove("show");
    });
  });
}

// price filter
if (priceDropdown) {
  const priceOptions = priceDropdown.querySelectorAll("div[data-filter]");
  priceOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const filter = option.dataset.filter;
      priceBtn.textContent = `${option.textContent}`;
      eventCardsArray.forEach((card) => {
        const cardPrice = card.querySelector(".price");
        const priceText = cardPrice.textContent.trim().toLowerCase();

        card.classList.remove("hidden");
        if (filter === "free" && priceText !== "free") {
          card.classList.add("hidden");
        } else if (filter === "paid" && priceText === "free") {
          card.classList.add("hidden");
        }
      });
      priceDropdown.classList.remove("show");
    });
  });
}

// date filter
if (dateDropdown) {
  const applyFilterBtn = document.getElementById("applyDateFilter");
  applyFilterBtn.addEventListener("click", () => {
    const monthInput = document
      .getElementById("monthInput")
      .value.trim()
      .toLowerCase();
    const dayInput = document.getElementById("dayInput").value.trim();
    const yearInput = document.getElementById("yearInput").value.trim();

    eventCardsArray.forEach((card) => {
      const month = card.querySelector(".month").textContent;
      const day = card.querySelector(".day").textContent;
      const year = card.querySelector(".year").textContent;

      card.classList.remove("hidden");
      if (monthInput && month.toLowerCase() !== monthInput) {
        card.classList.add("hidden");
      }
      if (dayInput && day !== dayInput) {
        card.classList.add("hidden");
      }
      if (yearInput && year !== yearInput) {
        card.classList.add("hidden");
      }
    });
    dateDropdown.classList.remove("show");
  });
}

// search events filter
const searchInput = document.querySelector(".form-control");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    eventCardsArray.forEach((card) => {
      const title = card
        .querySelector(".event-title")
        .textContent.toLowerCase();
      card.classList.remove("hidden");
      if (!title.includes(searchTerm)) {
        card.classList.add("hidden");
      }
    });
  });
}

document.addEventListener("click", (e) => {
  if (
    !e.target.closest(".filter-buttons") &&
    !e.target.closest(".dropdown-menu-custom")
  ) {
    document
      .querySelectorAll(".dropdown-menu-custom")
      .forEach((menu) => menu.classList.remove("show"));
  }
});

document.addEventListener("DOMContentLoaded", loadEvents);
