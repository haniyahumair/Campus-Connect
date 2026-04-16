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
        if (event.is_free === true){
        document.querySelector('.price').textContent = "💵 Free";
    }
    else{
        document.querySelector('.price').textContent = `💵 ${event.price} QAR`;
    }
    document.querySelector('.description').textContent = event.description;
    document.querySelector('.type-text').textContent = event.category;
    document.querySelector('.date-text').textContent = event.date;
    document.querySelector('.time-text').textContent = event.start_time;
    document.querySelector('.location-text').textContent = event.location;
    document.querySelector('.email-text').textContent = event.contact_details;
    (function setMap() {
        const iframe = document.getElementById('mapsIframe');
        const container = document.querySelector('.maps-display');
        console.log('setMap() start', { eventId: event?.id, iframeFound: !!iframe, iframeId: iframe?.id });
       
        if (!iframe) return;
        const rawMap = event.map_embed_url || ''; 
        console.log('rawMap from DB:', rawMap);
        console.log('event.location:', event.location);

        function isEmbedUrl(u) {
            return /\/embed\/|google\.com\/maps\/embed|maps\.googleapis\.com/.test(u);
        }

        function isGoogleMapUrl(u) {
            return /google\.com\/maps/.test(u);
        }

        if (!container) {
            console.warn('maps-display container not found');
            if (iframe) iframe.style.display = 'none';
            return;
        }

        if (rawMap && isEmbedUrl(rawMap)) {
            console.log('Using embeddable rawMap in iframe:', rawMap);
            if (iframe) { iframe.src = rawMap; iframe.style.display = ''; }
            return;
        }
        // Fallback
        const loc = (event.location || '').trim();
        if (loc) {
            iframe.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(loc) + '&output=embed';
            return;
        }
        iframe.style.display = 'none';
    })();


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

//if there are items in cart but not yet purchased, then the registraiton should upload, with status = "pending" and payment_status = "unpaid". 
async function awaitingPayment(userId, eventId) {
    if (!userId || !eventId) return;
    
    const { data: existing } = await supabase
      .from("registration")
      .select("*")
      .eq("user_id", userId )
      .eq("event_id", eventId)
      .eq("payment_status", "unpaid")
      .single();
  
    if (existing) return;
  
    const { error } = await supabase
      .from("registration")
      .insert({
        user_id: userId,
        event_id: eventId,
        status: "pending",
        payment_status: "unpaid",
        registration_date: new Date().toISOString(),
      });
  
    if (error) console.error("Pending registration error:", error);
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

        await awaitingPayment(user.id, eventId);

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