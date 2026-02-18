import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();
// helpers
const safe = el => el !== null && el !== undefined;
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

// remove item logic
window.removeItem = function removeItem(itemId) {
    const el = document.getElementById(itemId);
    if (!safe(el)) return;
    
    el.remove();
};

// quantity button logic
function wireQuantityButtons() {
    const qtyButtons = qsa('.qty-btn'); // matches cart.html 
    if (!qtyButtons.length) return;
    
    qtyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const change = parseInt(btn.getAttribute('data-change')) || 0;
            const container = btn.closest('.quantity-control');
            if (!container) return;
            
            const quantitySpan = container.querySelector('.quantity');
            const hiddenInput = container.querySelector('input[type="hidden"]');
            
            let current = parseInt(quantitySpan.textContent) || 1;
            current = Math.max(1, current + change);
            
            quantitySpan.textContent = current;
            if (hiddenInput) hiddenInput.value = current;
        });
    });
}

// checkout form logic 
function wireCheckout() {
    const form = qs('#checkoutForm') || qs('form.checkout-form');
    if (!safe(form)) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Checkout was successful! Your events have been added to your profile.');
        window.location.href = 'profile.html';

        // gather form data if needed
        const fd = new FormData(form);
        const entries = {};
        fd.forEach((value, key) => {
            entries[key] = value;
        });
    });
}

//if price is not free then show alert message on checkout
const priceElement = document.getElementById('.item-price');
if (priceElement && priceElement.textContent.trim().toLowerCase() !== 'free') {
    const checkoutButton = document.getElementById('checkoutButton');   
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Please select free event. Payment methods are not supported yet.');
        });
    }
}

document.addEventListener('DOMContentLoaded',  () => {
    wireQuantityButtons();
    wireCheckout();
});