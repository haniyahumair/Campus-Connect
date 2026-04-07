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

  loadAll();

  //load event
    async function loadAll() {
    // Fetch pending events
    const { data: pendingData, error: pendingError } = await supabase
      .from("events")
      .select("*")
      .eq("event_status", "pending");
  
    if (pendingError) {
      console.error("Error fetching pending events:", pendingError);
      return;
    }
  
    // Update pending events count and populate pending table
    const pendingCount = pendingData.length;
    const sideBar = document.getElementById("navPending");
    const statCards = document.getElementById("statsPending");
    if (sideBar) {
      sideBar.innerHTML = `<span class="nav-icon">⏳</span> Pending Events <span class="nav-badge" id="pendingCount">${pendingCount}</span>`
    }

    if (statCards) {
      statCards.innerHTML = pendingCount;
    }
  
    populatePending(pendingData);
  
    // Fetch all events
    const { data: allEvents, error: allError } = await supabase
      .from("events")
      .select("*");
  
    if (allError) {
      console.error("Error fetching all events:", allError);
      return;
    }
  
    // Update stat cards and sidebar counts
    const allEventsCount = allEvents.length;
    const approvedEvents = allEvents.filter(event => event.event_status === "approved");
    const totalRegisteredCount = allEvents.reduce((total, event) => total + event.current_registration, 0);
    const avgFillRate = allEvents.reduce((total, event) => total + (event.max_capacity > 0 ? (event.current_registration / event.max_capacity) : 0), 0) / allEvents.length * 100;
    const approvedEventsStatCard = document.getElementById("statsApproved");
    const allEventsSidebar = document.getElementById("allCount");
    const registeredStatsCard = document.getElementById("statsRegistered");
    const avgFillRateCard = document.getElementById("statsFilled");
    
    
    if (approvedEventsStatCard) {
      approvedEventsStatCard.textContent = approvedEvents.length;
    }

    if(allEventsSidebar){
      allEventsSidebar.textContent = allEventsCount;
    }

    if(registeredStatsCard){
      registeredStatsCard.textContent = totalRegisteredCount;
    }

    if(avgFillRateCard){
      avgFillRateCard.textContent = `${avgFillRate.toFixed(2)}%`;
    }
  
    // Populate all events table and stats table & view
    populateAll(allEvents);
    statusBar(allEvents);
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

  //notification dropdown
  const notificationBtn = document.getElementById("notificationBtn");
  const notificationDropdown = document.getElementById("notifDropdown");

  notificationBtn.addEventListener("click", () => {
    notificationDropdown.style.display =
      notificationDropdown.style.display === "block" ? "none" : "block";
  });

  window.addEventListener("click", (e) => {
    if (
      !notificationBtn.contains(e.target) &&
      !notificationDropdown.contains(e.target)
    ) {
      notificationDropdown.style.display = "none";
    }
  });

  //refresh button
  const refreshBtn = document.getElementById("refreshBtn");
  refreshBtn.addEventListener("click", () => {
    // loadAll();
    location.reload();
  });

  //avatar dropdown
  const avatarBtn = document.querySelector(".avatar");
  const avatarDropdown = document.getElementById("avatarDropdown");

  avatarBtn.addEventListener("click", () => {
    avatarDropdown.style.display =
      avatarDropdown.style.display === "block" ? "none" : "block";
  });

  window.addEventListener("click", (e) => {
    if (!avatarBtn.contains(e.target) && !avatarDropdown.contains(e.target)) {
      avatarDropdown.style.display = "none";
    }
  });

  //avatar initial based on name from supabase
  async function setAvatarInitial() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return;
    }
    if (!user) {
      console.error("No user found");
      return;
    }

    if (user.is_admin === false) {
      console.error("User is not an admin");
      window.location.href = "/pages/login.html";
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return;
    }

    if (!profile?.full_name) {
      console.error("Profile full_name not found.");
      return;
    }

    const initial = profile.full_name.charAt(0).toUpperCase();
    const avatarElement = document.querySelector(".avatar");
    if (!avatarElement) {
      console.error("Avatar element not found in the DOM.");
      return;
    }
    avatarElement.textContent = initial;
  }

  setAvatarInitial();

    // Populate pending table
  let pendingEvents = [];
  
  function populatePending(events) {
    pendingEvents = events;
    renderPendingTable();
  }
  
  function renderPendingTable() {
    const tbody = document.getElementById("pending-tbody");
  
    // Clear the table body
    tbody.innerHTML = "";
  
    // Show or hide the "No Pending Events" message
    document.getElementById("noPending").style.display = pendingEvents.length === 0 ? "" : "none";
  
    // Render all pending events
    pendingEvents.forEach((event) => {
      const price = event.price === 0 ? "badge badge-free" : "badge badge-paid";
      tbody.innerHTML += `
        <tr>
          <td>
            <div class="cell-title">${event.title}</div>
            <div class="cell-sub">Submitted ${event.created_at}</div>
          </td>
          <td>${event.category}</td>
          <td>${event.date}</td>
          <td>${event.location}</td>
          <td>${event.contact_details}</td>
          <td><span class="${price}">${event.price === 0 ? "Free" : `QAR ${event.price}`}</span></td>
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
  
    // Update the label to show the total number of pending events
    const pendingPagination = document.querySelector(".pending-pagination");
    if (pendingPagination) pendingPagination.textContent = `Showing ${pendingEvents.length} pending events`;
  }

  //populate all events table
    function populateAll(events) {
    const tbody = document.getElementById("allTBody");
    if (!tbody) {
      console.error("Element with id 'allTBody' not found in the DOM.");
      return;
    }
  
    tbody.innerHTML = "";
    events.forEach((event) => {
      const widthPercentage = (event.current_registration / event.max_capacity) * 100;
  
      // Check if event is free or paid
      const price = event.price === 0 ? "badge badge-free" : "badge badge-paid";
  
      // Check status of event
      let statusClass = "badge";
      if (event.event_status === "pending") {
        statusClass += " badge-pending";
      } else if (event.event_status === "approved") {
        statusClass += " badge-approved";
      } else if (event.event_status === "rejected") {
        statusClass += " badge-rejected";
      }
  
      tbody.innerHTML += `
        <tr>
          <td>
            <div class="cell-title">${event.title}</div>
            <div class="cell-sub">org: ${event.org_id}</div>
          </td>
          <td>${event.category}</td>
          <td>${event.date} · ${event.start_time} - ${event.end_time}</td>
          <td>${event.location}</td>
          <td>
            <div class="att-wrap">
              <div class="att-bar">
                <div class="att-fill" style="width:${widthPercentage}%;"></div>
              </div>
              <span class="att-label">${event.current_registration}/${event.max_capacity}</span>
            </div>
          </td>
          <td><span class="${price}">${event.price === 0 ? "Free" : `QAR ${event.price}`}</span></td>
          <td><span class="${statusClass}">${event.event_status}</span></td>
          <td><span class="badge ${event.is_active ? "badge-active" : "badge-inactive"}">
            ${event.is_active ? "Active" : "Inactive"}
          </span></td>
          <td><button class="row-btn" onclick="openModal('${event.id}')">View</button></td>
        </tr>
      `;
    });
  }

  //populate stats and attendance table
    function statusBar(events) {
    const statsAttendanceTbody = document.getElementById("statsTBody");
    if (!statsAttendanceTbody) {
      console.error("Element with id 'statsTBody' not found in the DOM.");
      return;
    }
  
    statsAttendanceTbody.innerHTML = "";
    events.forEach((event) => {
      const widthPercentage = event.max_capacity > 0
        ? (event.current_registration / event.max_capacity) * 100
        : 0;
  
      let statusClass = "badge";
      if (event.event_status === "pending") {
        statusClass += " badge-pending";
      } else if (event.event_status === "approved") {
        statusClass += " badge-approved";
      } else if (event.event_status === "rejected") {
        statusClass += " badge-rejected";
      }
  
      statsAttendanceTbody.innerHTML += `
        <tr>
          <td style="display: flex; flex-direction: column; gap: 4px;">
            <div class="cell-title">${event.title}
            <span class="cell-sub">org: ${event.org_id}</span>
            </div>
          </td>
          <td>${event.category}</td>
          <td>${event.date} · ${event.start_time} - ${event.end_time}</td>
          <td>${event.current_registration}</td>
          <td>${event.max_capacity}</td>
          <td>
            <div class="att-wrap">
              <div class="att-bar">
                <div class="att-fill" style="width:${widthPercentage}%;"></div>
              </div>
              <span class="att-label">${widthPercentage.toFixed(2)}%</span>
            </div>
          </td>
          <td><span class="${statusClass}">${event.event_status}</span></td>
        </tr>
      `;
    });
  }

  //search feature in pending table
  const searchBarPending = document
    .getElementById("searchBarPending")
    .querySelector("input");

  searchBarPending.addEventListener("input", () => {
    const query = searchBarPending.value.toLowerCase();
    document.querySelectorAll("#pending-tbody tr").forEach((row) => {
      const title = row.querySelector(".cell-title").textContent.toLowerCase();
      const category = row.children[1].textContent.toLowerCase();
      const location = row.children[3].textContent.toLowerCase();
      if (
        title.includes(query) ||
        category.includes(query) ||
        location.includes(query)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  //search feature in all events table
  const searchBarAll = document
    .getElementById("searchBarAll")
    .querySelector("input");

  searchBarAll.addEventListener("input", () => {
    const query = searchBarAll.value.toLowerCase();
    document.querySelectorAll("#all-tbody tr").forEach((row) => {
      const title = row.querySelector(".cell-title").textContent.toLowerCase();
      const category = row.children[1].textContent.toLowerCase();
      const location = row.children[3].textContent.toLowerCase();
      if (
        title.includes(query) ||
        category.includes(query) ||
        location.includes(query)
      ) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });

  //aprove events with notification
  window.quickApprove = async function (eventId) {
    // fetch event first to get student id and title
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("title, org_id")
      .eq("id", eventId)
      .single();

    if (fetchError) {
      console.error(fetchError);
      return;
    }

    // update status
    const { error } = await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", eventId);

    if (error) {
      console.error(error);
      return;
    }

    //send notification to student
    await supabase.from("notifications").insert({
      user_id: event.org_id,
      event_id: eventId,
      message: `Your event "${event.title}" was approved! Check it out on the events page.`,
      is_read: false,
    });

    loadAll();
  };

  //event modal
  async function openModal(eventId) {
    currentEventId = eventId;

    const modal = document.getElementById("eventsDetailModal");
    modal.style.display = "flex";

    //pull in supabase data
    const { data: event } = await supabase
      .from("events")
      .select("*, org_id (id, full_name)")
      .eq("id", eventId)
      .single();
    document.getElementById("modalSubtitle").innerHTML = `Submitted by ${event.org_id.full_name}`;
    document.getElementById("modalImg").innerHTML = event.img_url
      ? `<img src="${event.img_url}" alt="Event Image">`
      : `<img src="/assets/Images/default-event.jpg" alt="Placeholder Image">`;
    document.getElementById("modalTitle").textContent = event.title;
    document.getElementById("modalDescription").textContent = event.description;
    document.getElementById("modalDate").textContent = event.date;
    document.getElementById("modalTime").textContent = `${event.start_time} - ${event.end_time}`;
    document.getElementById("modalLocation").textContent = event.location;
    document.getElementById("modalCategory").textContent = event.category;
    document.getElementById("modalContact").textContent = event.contact_details;
    document.getElementById("modalPrice").textContent =
      event.price === 0 ? "Free" : `QAR ${event.price}`;
    document.getElementById("modalMaxAttendees").textContent = event.max_capacity;
    document.getElementById("modalRegistered").textContent =
      event.current_registration;
    document.getElementById("modalUserID").textContent = event.org_id.id;
    document.getElementById("modalCreated").textContent = new Date(
      event.created_at
    ).toLocaleString();

    // show acctpt/reject buttions when event still pending
    const status = event.event_status;
    let statusClass = "badge";
    if (status === "pending") statusClass += " badge-pending";
    else if (status === "approved") statusClass += " badge-approved";
    else if (status === "rejected") statusClass += " badge-rejected";
    document.getElementById("modalStatus").innerHTML = `<span class="${statusClass}">${status}</span>`;
    
    document.getElementById("modalFooter").style.display = status === "pending" ? "flex" : "none";

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function closeModal() {
    document.getElementById("eventsDetailModal").style.display = "none";
  }

  window.closeModal = closeModal;
  window.openModal = openModal;

  //reject modal
  function openRejectModal() {
    const rejectModal = document.getElementById("rejectModal");
    rejectModal.style.display = "flex";

    rejectModal.addEventListener("click", (e) => {
      if (e.target === rejectModal) closeRejectModal();
    });
  }

  function closeRejectModal() {
    document.getElementById("rejectModal").style.display = "none";
    document.getElementById("rejectReason").value = "";
  }

  window.confirmReject = async function () {
    const reason = document.getElementById("rejectReason").value.trim();

    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("title, org_id")
      .eq("id", currentEventId)
      .single();

    if (fetchError) { console.error(fetchError); return; }

    const { error } = await supabase
      .from("events")
      .update({ event_status: "rejected", rejection_reason: reason || null })
      .eq("id", currentEventId);

    if (error) { console.error(error); return; }

    await supabase.from("notifications").insert({
      user_id: event.org_id,
      event_id: currentEventId,
      message: `Your event "${event.title}" was not approved.${reason ? ` Reason: ${reason}` : ""} Please try again.`,
      is_read: false,
    });

    closeRejectModal();
    closeModal();
    loadAll();
  };

  // accept event
  window.openRejectModal = openRejectModal;
  window.closeRejectModal = closeRejectModal;

  window.quickReject = function (eventId) {
    currentEventId = eventId;
    openRejectModal();
  };

  window.doApprove = async function () {
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("title, org_id")
      .eq("id", currentEventId)
      .single();

    if (fetchError) { console.error(fetchError); return; }
    
    const { error } = await supabase
      .from("events")
      .update({ event_status: "approved" })
      .eq("id", currentEventId);
    
    if (error) { console.error(error); return; }
    
    await supabase.from("notifications").insert({
      user_id: event.org_id,
      event_id: currentEventId,
      message: `Your event "${event.title}" was approved! Check it out on the events page.`,
      is_read: false,
    });
    
    closeModal();
    loadAll();
  };

  // T&C from file
  const termsRes = await fetch("/terms&conditions.txt");
  const termsAndConditions = termsRes.ok ? await termsRes.text() : "";

  //injecting event information into prompt
  await loadAll();

  console.log("Pending events to be reviewed by AI:", pendingEvents);
  const formattedPendingEvents = pendingEvents.map(event => `
    - Title: ${event.title} 
    - ID: ${event.id}
    - Description of event: ${event.description}
    - Date: ${event.date} · ${event.start_time} - ${event.end_time}
    - Location: ${event.location}
    - Status: ${event.event_status}`).join("\n");
  
  //prompt for AI chatbot
  const promptInput = `You are an admin assistant for Campus Connect. Your role is to help the admin manage events, answer questions about event details, and flag any policy violations.

  TERMS AND CONDITIONS:
  ${termsAndConditions}

  When reviewing events, check them against the terms above and clearly flag any violations so the admin can decide whether to approve or reject the posting.
  
  PENDING EVENTS:
  ${formattedPendingEvents}
  
  Using the information above, assist the admin in managing events and answering any questions they may have about the pending events. Always refer to the terms and conditions when evaluating events. Provide clear explanations for any flagged issues, and why a certain event is set to be rejected.
  
  If asked by the admin to provide a reason for rejection of an event, use the information from the terms and conditions and the event details to generate a clear and concise reason that can be communicated to the event organizer.`;

  //initialize chatbot
  initChatbot(promptInput);

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

    closeAiBtn.style.display = aiPanel.classList.contains("open")
      ? "block"
      : "none";
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

  //signout
  const logOutBtn = document.getElementById("logOutBtn");

  logOutBtn.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      window.location.href = "/pages/login.html";
    }
  });
}

document.addEventListener("DOMContentLoaded", initAdminPage);
