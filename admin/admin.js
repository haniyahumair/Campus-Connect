import { supabase } from "../scripts/config/supabase.js";
import { initChatbot } from "./ai.js";
let currentEventId = null;
async function initAdminPage() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
      window.location.href = '/pages/login.html'
      return
  }

  const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

  if (profile?.role !== 'admin') {
      window.location.href = '/pages/profile.html'
      return
  }

  loadAll()
}

// sidebar functionality (panel switching)
window.showPanel = function (panel, element) {
  // remove active class from panels
  document
    .querySelectorAll(".panel")
    .forEach((p) => p.classList.remove("active"));

  // removes active class from sidebar items
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));

  if (element) element.classList.add("active");

  if (panel === "pending") {
    document.getElementById("pendingPanel").classList.add("active");
    document.getElementById("page-title").textContent = "Pending Events";
  }

  if (panel === "all") {
    document.getElementById("allEventsPanel").classList.add("active");
    document.getElementById("page-title").textContent = "All Events";
  }

  if (panel === "stats") {
    document.getElementById("panelStats").classList.add("active");
    document.getElementById("page-title").textContent = "Stats & Attendance";
  }
};

// populate table
function populatePending(events) {
  const tbody = document.getElementById("pending-tbody");
  const pending = events.filter((e) => e.status === "pending");
  tbody.innerHTML = "";
  pending.forEach((event) => {
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="cell-title">${event.title}</div>
          <div class="cell-sub">Submitted ${event.created_at}</div>
        </td> 
        <td>${event.category}</td>
        <td>${event.date}</td>
        <td>${event.location}</td>
        <td>${event.contact}</td>
        <td>${event.price}</td>
        <td> 
          <div class="row-actions">
            <button class="row-btn" onclick="openModal('${event.id}')">View</button>
            <button class="row-btn approve" onclick="quickApprove('${event.id}')">✓ Approve</button>
            <button class="row-btn reject" onclick="quickReject('${event.id}')">✕ Reject</button>
          </div>
        </td>
      </tr>
    `;
  });
}

//aprove events with notification
window.quickApprove = async function (eventId) {
  // ✅ fetch event first to get student id and title
  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("title, org_id")
    .eq("id", eventId)
    .single();

  if (fetchError) { console.error(fetchError); return; }

  // update status
  const { error } = await supabase
    .from("events")
    .update({ status: "approved" })
    .eq("id", eventId);

  if (error) { console.error(error); return; }

  //send notification to student
  await supabase.from("notifications").insert({
    user_id: event.org_id,
    event_id: eventId,
    message: `Your event "${event.title}" was approved! Check it out on the events page.`,
    is_read: false,
  });

  loadAll();
};

window.quickReject = async function (eventId) {
  //ask for rejection reason
  const reason = prompt("Enter rejection reason:");
  if (!reason) return;

  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("title, org_id")
    .eq("id", eventId)
    .single();

  if (fetchError) { console.error(fetchError); return; }

  const { error } = await supabase
    .from("events")
    .update({ status: "rejected", rejection_reason: reason })
    .eq("id", eventId);

  if (error) { console.error(error); return; }

  //send notification to student
  await supabase.from("notifications").insert({
    user_id: event.org_id,
    event_id: eventId,
    message: `Your event "${event.title}" was not approved. Reason: ${reason}. Please try again.`,
    is_read: false,
  });

  loadAll();
};

// Initialize the chatbot
initChatbot();


// AI chatbot overlay view
const chatBotSidebar = document.querySelector(".ai-sidebar-btn");
const askAiBtn = document.querySelector(".ai-top-btn");
const chatBotOverlay = document.getElementById("overlay");
const closeAiBtn = document.querySelector(".ai-close");
const aiChips = document.querySelectorAll(".ai-chips .chip");

function toggleAI() {
  const aiPanel = document.getElementById("ai-panel");
  aiPanel.classList.toggle("open");
  chatBotOverlay.classList.toggle("open");

  closeAiBtn.style.display = aiPanel.classList.contains("open") ? "block" : "none";
}

// Event listeners to toggle the AI panel
chatBotSidebar.addEventListener("click", toggleAI);
askAiBtn.addEventListener("click", toggleAI);
closeAiBtn.addEventListener("click", toggleAI);
chatBotOverlay.addEventListener("click", toggleAI);

// Add event listeners for AI chips
aiChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const chipText = chip.textContent.trim();
    document.getElementById("ai-input").value = chipText;
    sendAI(); // Trigger the sendAI function
  });
});

console.log(chatBotSidebar, askAiBtn, closeAiBtn);