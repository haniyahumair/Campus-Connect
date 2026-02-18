export function createNavbar() {
    return `
    <nav class="navbar">
            <!-- Brand -->
            <div class="brand-name">
                <img src="/assets/Icons/Logo.svg" alt="CampusConnect Logo" class="logo">
                <p class="CampusConnect">Campus<b>Connect</b></p>
            </div>

            <!-- Nav Links -->
            <ul class="navbar-nav">
                <li>
                    <a class="nav-link" href="../index.html">Home</a>
                </li>
                <li>
                    <a class="nav-link" href="/pages/events.html">Events</a>
                </li>
                <li>
                    <a class="nav-link  createEvent" href="#" >Create Event</a>
                </li>
            </ul>

            <!--Icons shown when user is logged in-->
            <div class="icons">
                <a href="/pages/cart.html" class="cart-icon" id="cartIcon">
                    <img src="/assets/Icons/cart-Icon.svg" alt="Cart-Icon">
                </a>

                <a href="/pages/profile.html" class="profile-icon" id="profileIcon">
                    <img src="/assets/Icons/userIcon.svg" alt="User-Icon" style="width: 35px;">
                </a>
            </div>
    

            <!-- Login Button -->
            <a class="btn-primary" href="/pages/login.html" id="loginBtn">Login</a>
        </nav>
    `;
}