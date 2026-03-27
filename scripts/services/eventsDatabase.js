import { supabase } from "../config/supabase.js";
import { createNavbar } from "../components/navbarComponent.js";
import { createFooter } from "../components/footerComponent.js";
import { showModal } from "../utils/modal.js";
import { getWishlist, toggleWishlist } from "./wishlist.js";

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

async function loadEventDetails() {
    const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (error) {
        console.error("Error loading event details:", error);
        return;
    }

    document.querySelector('.event-title').textContent = event.title;
    document.querySelector('.image').src = event.img_url;
    document.querySelector('.price').textContent = `💵 ${event.price}` ?? "💵 Free";
    document.querySelector('.description').textContent = event.description;
    document.querySelector('.type-text').textContent = event.category;
    document.querySelector('.date-text').textContent = event.date;
    document.querySelector('.time-text').textContent = event.start_time;
    document.querySelector('.location-text').textContent = event.location;
    document.querySelector('.email-text').textContent = event.contact_details;

    //wishlist
    const { data: { user } } = await supabase.auth.getUser();
    const heartIcon = document.querySelector('.details-pg img');
    if (user) {
        const savedEvents = await getWishlist(user);
        const isSaved = savedEvents.some(e => e.event_id === event.id);
        heartIcon.src = isSaved ? "/assets/Icons/Heart filled peach.svg" : "/assets/Icons/Heart outline peach.svg";
        console.log(`Details page wishlist loaded — event ${event.id} is ${isSaved ? "saved" : "not saved"}`);
    } else {
        console.log("No user logged in — skipping wishlist pre-fill on details page");
    }

    document.querySelector('.save-event').addEventListener('click', async () => {
        console.log(`Save button clicked — event ID: ${event.id}, user: ${user?.id ?? "not logged in"}`);
        await toggleWishlist(user, event.id, heartIcon);
        console.log(`toggleWishlist completed for event ID: ${event.id}`);
    });
}

async function addToCart() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            window.location.href = '/pages/login.html';
            return;
        }

        const { data: existing } = await supabase
            .from('cart')
            .select('*')
            .eq('user_id', user.id)
            .eq('event_id', eventId)
            .single();

        if (existing) {
            alert('Already in cart!');
            return;
        }

        const { error } = await supabase.from('cart').insert({
            user_id: user.id,
            event_id: eventId,
            quantity: 1
        });

        if (error) throw error;
        showModal(
            'Succesfully added to Cart!',
            'You will now be redirected to your Cart!ß',
            'success',
            {
                autoClose: 3000,
                onClose: () => {
                    window.location.href = '/pages/cart.html'
                }
            }
        )

    } catch (error) {
        console.error('Error adding to cart:', error);
        showModal(
            'Failed to add event to Cart!',
            'Please try again!.',
            'error',
            {
                autoClose: 3000,
                onClose: () => {
                    window.location.href = '/pages/events.html'
                }
            }
        )
    }
}

document.addEventListener("DOMContentLoaded", loadEventDetails);

// share button
const shareButton = document.querySelector('.share-button');
shareButton.addEventListener('click', () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL)
        .then(() => alert('URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy URL:', err));
});

// cart button
document.getElementById('cartBtn').addEventListener('click', addToCart);