//ai api will be added in config.js and imported from there 
//make the sidebar functionality work (what is displayed shoudl match the link in sidebar
//search and filter functionality works
//approve reject buttons is the main focus on functionlity -- make those work and connect it with being displayed on the campusconnect websiet (ill help!!)
// ill add a notification feature on campusconnect so we need to deliver that notification and get back here when a new event is added in the pending/waiting approval queue somehow - through supaabse user and admin ids most likely -- whatever the easiset way is 

import { supabase } from "../scripts/config/supabase.js";

let currentEventId = null;

// sidebar functionality (panel switching)
window.showPanel = function(panel, element) {
  
  // remove active class from panels
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  
  // removes active class from sidebar items
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  
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

// load events from supabase
window.loadALL = async function () {
  
  const { data, error } = await supabase
         .from ("events")
         .select("*");

  if (error) {
    console.error("Supabase error: ", error);
    return;
  }

  if (data) {
    populatePending(data);
    // Ensure this function exists or comment it out if not yet built
    if (typeof populateAll === "function") {
        populateAll(data);
    }
  }
};

// populate table
function populatePending(events) {
  const tbody = document.getElementById("pending-tbody");
  const pending = events.filter(e => e.status === "pending");
  tbody.innerHTML = "";
  pending.forEach(event => {
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

// approve event
window.quickApprove = async function(eventId) {
  const { error } = await supabase
    .from("events")
    .update({ status: "approved" })
    .eq("id", eventId);
  if (error) {
    console.error(error);
    return;
  }
  
  loadAll();
};
//reject event
window.quickReject = async function(eventId) {
  const { error } = await supabase
    .from("events")
    .update({ status: "rejected" })
    .eq("id", eventId);
  if (error) {
    console.error(error);
    return;
  }
  
  loadAll();
};
    
