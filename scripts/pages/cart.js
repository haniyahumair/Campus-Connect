import { supabase } from '../config/supabase.js'
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';
import { showModal } from '../utils/modal.js'

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();

document.addEventListener('DOMContentLoaded', () => {
    loadCart();        
});

let currentUserId = null;

async function loadCart() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (userError || !user) {
        console.warn("User not logged in");
        window.location.href = "/pages/login.html";
        return;
    }
    
    currentUserId = user.id;

    const { data: cartItems, error } = await supabase
        .from('cart')
        .select('*, events(*)')
        .eq('user_id', user.id);

    const container = document.getElementById("cartContainer");
    container.innerHTML = '';

    if (error || !cartItems || cartItems.length === 0) {
        showModal(
            'Failed to load Cart!',
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

    function formatTime(time) {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    cartItems.forEach(item => {
        const event = item.events;
        const formattedDate = new Date(event.date).toLocaleDateString('default', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        container.innerHTML += `
        <div class="cart-item" data-id="${event.id}">
            <div class="item-image">
                <img src="${event.img_url}" />
            </div>
            <div class="item-details">
                <h5>${event.title}</h5>
                <p class="about">${event.description}</p>
                <div class="date-time-container">
                    <p class="date">📅 ${formattedDate}</p>
                    <div class="time">
                        <p class="start-time">${formatTime(event.start_time)}</p>  
                        <p class="end-time">${formatTime(event.end_time)}</p>  
                    </div>    
                </div> 
                <p class="location">📍${event.location}</p>
                <div class="type-of-event">
                    <button class="event-type">
                        <img src="/assets/Icons/Star 1.svg" alt="Star-Icon">
                        ${event.category}
                    </button>
                </div>
            </div>
            <hr>
            <div class="item-actions">
                <p class="item-price">${event.price === 0 ? 'Free' : '💵 ' + event.price}</p>
                <div class="quantity-control">
                    <button class="qty-btn" data-change="-1">−</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" data-change="1">+</button>
                </div>
                <button class="remove-btn" data-id="${event.id}">✖ Remove</button>
            </div>
        </div>`;
    });

async function removeFromCart(eventId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', currentUserId)
        .eq('event_id', eventId);

    if (error) {
        console.error('Error removing from cart:', error);
        return;
    }

    loadCart();
}

async function updateQuantity(eventId, newQuantity) {
    console.log('currentUserId:', currentUserId);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('cart')
        .update({ quantity: newQuantity })
        .eq('user_id', currentUserId)
        .eq('event_id', eventId);

    if (error) {
        console.error("Cart error:", error);
        showModal('Failed to load Cart!', 'Please try again!', 'error');
        return;
    }
    
    if (!cartItems || cartItems.length === 0) {
        container.innerHTML = "<p>Your cart is empty</p>";
        return;
    }

    loadCart();
}

document.getElementById("cartContainer").addEventListener('click', (e) => {
    
    if (e.target.classList.contains('remove-btn')) {
        const eventId = e.target.dataset.id;
        removeFromCart(eventId);
    }
    
    if (e.target.classList.contains('qty-btn')) {
        const cartItem = e.target.closest('.cart-item');
        const eventId = cartItem.dataset.id;
        const quantitySpan = cartItem.querySelector('.quantity');
        
        let currentQty = parseInt(quantitySpan.textContent);
        const change = parseInt(e.target.dataset.change);
        const newQty = currentQty + change;
        
        if (newQty < 1) return;
        
        updateQuantity(eventId, newQty);
    }
});
