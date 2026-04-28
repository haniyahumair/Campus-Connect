import { supabase } from "../config/supabase.js";
import { createNavbar } from "../components/navbarComponent.js";
import { createFooter } from "../components/footerComponent.js";
import { showModal } from "../utils/modal.js";

document.querySelector("header").innerHTML = createNavbar();
document.querySelector("footer").innerHTML = createFooter();

document.addEventListener("DOMContentLoaded", () => {
  loadCart();

  const applePayBtn = document.getElementById("apple-pay-btn");
  const paypalBtn = document.querySelector(".paypal-btn");
  const cardBtn = document.querySelector(".payment-btn");

  applePayBtn.addEventListener("click", handlePayment);
  paypalBtn.addEventListener("click", handlePayment);
  cardBtn.addEventListener("click", handlePayment);

  document.getElementById("cartContainer").addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const eventId = e.target.dataset.id;
      removeFromCart(eventId);
    }

    if (e.target.classList.contains("qty-btn")) {
      const cartItem = e.target.closest(".cart-item");
      const eventId = cartItem.dataset.id;
      const quantitySpan = cartItem.querySelector(".quantity");

      let currentQty = parseInt(quantitySpan.textContent);
      const change = parseInt(e.target.dataset.change);
      const newQty = currentQty + change;

      if (newQty < 1) return;

      updateQuantity(eventId, newQty);
    }
  });
});

let currentUserId = null;

async function loadCart() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn("User not logged in");
    window.location.href = "/pages/login.html";
    return;
  }

  currentUserId = user.id;

  const { data: cartItems, error } = await supabase
    .from("cart")
    .select("*, events(*)")
    .eq("user_id", user.id);

  const container = document.getElementById("cartContainer");
  container.innerHTML = "";

  const eventTitle = document.getElementById("eventTitle");
  eventTitle.textContent = `You have ${
    cartItems ? cartItems.length : 0
  } item(s) in your cart`;

  const payementSection = document.querySelector(".cart-right");
  payementSection.style.display = "none";
  if (error) {
    console.error("Cart error:", error);
    showModal("Failed to load Cart!", "Please try again!", "error");
    return;
  }

  if (!cartItems || cartItems.length === 0) {
    container.innerHTML = `
            <div class="empty-cart" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px; border-radius:10px; background:#f9f9f9;">
                <p style="margin-bottom:20px; text-align: center;">Your cart is empty at the moment. <br> Discover amazing events and add them to your cart!</p>
                <a href="/pages/events.html" style="text-decoration:none;color:black;margin-top:15px;border:2px solid #FF8A80;padding:12px 15px;border-radius:35px;font-size:0.875rem">Browse Events</a>
            </div>
        `;
    return;
  }

  // If there are cart items, show payment section
  payementSection.style.display = "block";

  cartItems.forEach((item) => {
    const event = item.events;

    if (!event) {
      console.warn("Missing event data:", item);
      return;
    }

    const formattedDate = new Date(event.date).toLocaleDateString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    container.innerHTML += `
        <div class="cart-item" data-id="${item.event_id}">
            <div class="item-image">
                <img src="${event.img_url}" />
            </div>
            <div class="item-details">
                <h5>${event.title}</h5>
                <p class="about">${event.description}</p>
                <div class="date-time-container">
                    <p class="date">📅 ${formattedDate}</p>
                    <div class="time">
                        <p class="start-time">${formatTime(
                          event.start_time
                        )}</p>  
                        <p class="end-time">${formatTime(event.end_time)}</p>  
                    </div>    
                </div> 
                <p class="location">📍${event.location}</p>
                <div class="item-actions">
                <div class="quantity-control">
                    <button class="qty-btn" data-change="-1">−</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" data-change="1">+</button>
                </div>
                <hr class="cart-vertical-sep" />
                <p class="item-price">${
                  event.price === 0 ? "Free" : "QAR " + event.price
                }</p>
                <hr class="cart-vertical-sep" />
                <button class="remove-btn" data-id="${
                  item.event_id
                }">✖ Remove</button>
            </div>
            </div>
        </div>`;
  });

  if (cartItems && cartItems.length > 0) {
    payementSection.style.display = "block";
    updateCartTotal(cartItems);
  }
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

async function updateQuantity(eventId, newQuantity) {
  if (!currentUserId) return;

  const cartItem = document.querySelector(`.cart-item[data-id="${eventId}"]`);
  if (cartItem) {
    cartItem.querySelector(".quantity").textContent = newQuantity;
  }

  const { error } = await supabase
    .from("cart")
    .update({ quantity: newQuantity })
    .eq("user_id", currentUserId)
    .eq("event_id", eventId);

  if (error) {
    console.error("Cart error:", error);
    showModal("Failed to update Cart!", "Please try again!", "error");
    loadCart();
    return;
  }
}

async function removeFromCart(eventId) {
  if (!currentUserId) return;

  const cartItem = document.querySelector(`.cart-item[data-id="${eventId}"]`);
  if (cartItem) cartItem.remove();

  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("user_id", currentUserId)
    .eq("event_id", eventId);

  if (error) {
    console.error("Error removing from cart:", error);
    loadCart();
    return;
  }
}

function calculateTotal(cartItems) {
  let total = 0;
  cartItems.forEach((item) => {
    if (item.events && item.events.price) {
      total += item.quantity * item.events.price;
    }
  });
  return total.toFixed(2);
}

function updateCartTotal(cartItems) {
  const cartTotal = document.getElementById("cartTotal");
  const total = calculateTotal(cartItems);
  cartTotal.textContent = `Total: QAR ${total}`;
}

async function handlePayment() {
  try {
    //success modal
    showModal("Payment Successful!", "Thank you for your purchase!", "success");

    //fetch cart items
    const { data: cartItems, error } = await supabase
      .from("cart")
      .select("*, events(*)")
      .eq("user_id", currentUserId);

    if (error) {
      console.error("Cart error:", error);
      showModal("Failed to load Cart!", "Please try again!", "error");
      return;
    }

    //update attendees count for each event and clear cart
    for (const item of cartItems) {
      const eventId = item.event_id;
      const quantity = item.quantity;

      // Update attendees count
      const { error: updateError } = await supabase.rpc(
        "increment_registration",
        {
          event_id: eventId,
          qty: quantity,
        }
      );

      console.log("updateError:", updateError);

      //registration entry
      const { error: registrationError } = await supabase
        .from("registration")
        .insert({
          user_id: currentUserId,
          event_id: eventId,
          status: "registered",
          payment_status: "paid",
          registration_date: new Date().toISOString(),
        });

      if (registrationError) {
        console.error(
          `Error creating registration for event ${eventId}:`,
          registrationError
        );
      }
    }

    // Clear cart
    const { error: clearError } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", currentUserId);

    if (clearError) {
      console.error("Error clearing cart:", clearError);
    }

    // Reload cart
    loadCart();
  } catch (error) {
    console.error("Payment error:", error);
    showModal("Payment Failed!", "Please try again!", "error");
  }
}
