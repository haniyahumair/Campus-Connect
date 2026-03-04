import { supabase } from "../config/supabase.js";
import { createNavbar } from "../components/navbarComponent.js";
import { createFooter } from "../components/footerComponent.js";

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();


async function loadEventDetails() {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id"); 

    const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (error) {
        console.error("Error loading event details:", error);
        return;
    }

    console.log("Event details:", event);

    document.querySelector('.event-title').textContent = event.title;
    document.querySelector('.image').src = event.img_url;
    document.querySelector('.price').textContent = `💵 ${event.price}` ?? "💵 Free";
    document.querySelector('.description').textContent = event.description;
    document.querySelector('.type-text').textContent = event.category;
    document.querySelector('.date-text').textContent = event.date;
    document.querySelector('.time-text').textContent = event.start_time;
    document.querySelector('.location-text').textContent = event.location;
    document.querySelector('.email-text').textContent = event.contact_details;
}

document.addEventListener("DOMContentLoaded", loadEventDetails);

//share button 
const shareButton = document.querySelector('.share-button');
shareButton.addEventListener('click', () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL)
        .then(() => alert('URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy URL:', err));
});