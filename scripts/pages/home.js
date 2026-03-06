// imports
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';
import { supabase } from '../config/supabase.js'
import { createEventCard } from '../components/eventCardsComponents.js';

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();


async function loadEvents() {
    const today = new Date().toISOString().split('T')[0];// date from today
    const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", today)
        .order("date", { ascending: true }) 
        .limit(3); //limited to display the 3 closes events 

    console.log("Events data:", events); 
    console.log("Error:", error);        
    
    if (error) {
        console.error("Error loading events:", error);
        return;
    }
    
    const container = document.getElementById("eventCardsContainer");
    container.innerHTML = "";

    events.forEach(event => {
        const date = new Date(event.date)
        const mappedEvent = {
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            price: event.price ?? "Free",
            image: event.img_url ?? event.image ?? "/assets/default-event.jpg",
            month: date.toLocaleString('default', { month: 'long' }),
            day: date.getDate(),                                       
            year: date.getFullYear(),                                  
            start: event.start_time ?? event.start,
            end: event.end_time ?? event.end,
            attendees: event.current_registrations ?? 0,
            capacity: event.max_capacity ?? 100,
            type: event.category ?? event.type,
            saveEvent: "/assets/Icons/Heart outline peach.svg" 
        };
        container.innerHTML += createEventCard(mappedEvent);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});