export function createNavbar() {
  return `
    <nav class="navbar">
      <div class="brand-name">
        <img src="/assets/Icons/Logo.svg" alt="CampusConnect Logo" class="logo">
        <p class="CampusConnect">Campus<b>Connect</b></p>
      </div>

      <button class="hamburger" id="hamburgerBtn" aria-label="Toggle menu">
        <img src="/assets/Icons/menu.svg" alt="Menu">
      </button>

      <div class="navbar-overlay" id="navbarOverlay"></div>

      <div class="navbar-menu" id="navbarMenu">
        <button class="close-menu" id="closeMenuBtn" aria-label="Close menu">✕</button> 
        <ul class="navbar-nav">
          <li><a class="nav-link" href="../index.html">Home</a></li>
          <li><a class="nav-link" href="/pages/events.html">Events</a></li>
          <li><a class="nav-link createEvent" href="#">Create Event</a></li>
        </ul>
        <div class="icons">
          <a href="/pages/cart.html" class="cart-icon" id="cartIcon">
            <img src="/assets/Icons/cart-Icon.svg" alt="Cart-Icon">
          </a>
          <div class="notif-bell" id="notifBell" style="display:none;">
            <button class="bell-btn" id="bellBtn">
              <img src="/assets/Icons/Bell.svg" alt="bell" style="width:24px;">
              <span class="bell-badge" id="bellBadge" style="display:none;">0</span>
            </button>
            <div class="notif-dropdown" id="notifDropdown" style="display:none;">
              <div class="notif-header">Notifications</div>
              <div class="notif-list" id="notifList">
                <p class="notif-empty">No notifications yet</p>
              </div>
            </div>
          </div>
          <a href="/pages/profile.html" class="profile-icon" id="profileIcon">
            <img id="userAvatar" alt="User-Icon" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
          </a>
        </div>
        <a class="btn-primary" href="/pages/login.html" id="loginBtn">Login</a>
      </div>

    </nav>
  `;
}

//mobile view toggle 
export function initNavbarToggle() {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('navbarMenu');
  const overlay = document.getElementById('navbarOverlay');
  const closeBtn = document.getElementById('closeMenuBtn');

  const close = () => {
    menu.classList.remove('open');
    overlay.classList.remove('open');
  };

  btn?.addEventListener('click', () => {
    menu.classList.toggle('open');
    overlay.classList.toggle('open');
  });

  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
  menu?.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', close));
}