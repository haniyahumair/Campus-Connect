//ai api will be added in config.js and imported from there 
//make the sidebar functionality work (what is displayed shoudl match the link in sidebar
//search and filter functionality works
//approve reject buttons is the main focus on functionlity -- make those work and connect it with being displayed on the campusconnect websiet (ill help!!)
// ill add a notification feature on campusconnect so we need to deliver that notification and get back here when a new event is added in the pending/waiting approval queue somehow - through supaabse user and admin ids most likely -- whatever the easiset way is 

import { supabase } from "../services/supabase.js";

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
  
  const ( data, error } = await supabase
         .from ("events")
         .select("*");

  if (error) {
    console.error(error);
    return;
  }

  populatePending(data);
  populateAll(data);
};

    
