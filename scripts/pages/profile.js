import { supabase } from '../config/supabase.js'
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';
import { createEventCard } from '../components/eventCardsComponents.js';
import { showModal } from '../utils/modal.js';

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadCreatedEvents();
    loadUpcomingEvents();
})

async function loadUserProfile() {
    showModal('Loading...', 'Please wait while we load your profile.', 'loading', 
        { 
            showButton: false,
         }
        
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
        alert('You must be logged in to view your profile.')
        window.location.href = '/pages/login.html'
        return
    }

    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error

        document.getElementById('profileName').textContent = profile.full_name
        document.getElementById('profileEmail').textContent = profile.email
        document.getElementById('profileRole').textContent = `🎓 ${profile.role}`
        document.getElementById('university').textContent = `🏫 ${profile.university}`
        document.getElementById('studentId').textContent = `🆔 ${profile.student_id}`
        document.getElementById('major').textContent = `📚 ${profile.major}`
        document.getElementById('yearOfStudy').textContent = `📅 Year ${profile.year_of_study}`
        document.getElementById('bioText').textContent = profile.bio || 'No bio available.'
        document.getElementById('profileAvatar').src = profile.avatar_url || '/assets/Icons/user-Icon.svg'

        closeModal()
        document.getElementById('profileContent').style.display = 'block'
        document.querySelector('.upcoming-events-header').style.display = 'block'
        document.querySelector('.my-events-header').style.display = 'block'
    }

    catch (error) {
        console.error('Error loading profile:', error)
        alert('Failed to load profile. Please try again later.')
    }
}

async function loadCreatedEvents() { 
    const { data: { user } } = await supabase.auth.getUser();
    const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .eq("org_id", user.id);

    if (error || !events || events.length === 0){
        container.innerHTML = `
            <div class="empty-state">
                <p>😔 Nothing to see here!</p>
                <p>You haven't created for any events yet.</p>
                <a href="/pages/create.html" class="btn btn-dark">Create Events</a>
            </div>
        `;        
        return;
    } 

    const container = document.getElementById("createdEventsContainer");
    container.innerHTML = "";
    events.forEach(event => {
        const date = new Date(event.date);
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

async function loadUpcomingEvents() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: registrations, error } = await supabase
        .from("registration")
        .select("*, events(*)")
        .eq("user_id", user.id);

    if (error || !registrations || registrations.length === 0 || events.length === 0){
        container.innerHTML = `
            <div class="empty-state">
                <p>😔 Nothing to see here!</p>
                <p>You haven't registered for any events yet.</p>
                <a href="/pages/events.html" class="btn btn-dark">Browse Events</a>
            </div>
        `;
        return;
    };

    const container = document.getElementById("upcomingEventsContainer");
    container.innerHTML = "";
    registrations.forEach(reg => {
        const event = reg.events; // 👈 pull the joined event
        const date = new Date(event.date);
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

//event details page 
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("viewDetailBtn")) {
        const eventId = e.target.dataset.id;
        window.location.href = `/pages/details.html?id=${eventId}`; 
    }
});

const signOutBtn = document.getElementById('signOutBtn')

signOutBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    
    try {
        const { error } = await supabase.auth.signOut()
        
        if (error) throw error
        window.location.href = '/pages/login.html'
        
    } catch (error) {
        console.error('Sign out error:', error)
        alert('Failed to sign out. Please try again.')
    }
})