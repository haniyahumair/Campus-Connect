// imports
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();

// constants
/*const btnLogin = document.querySelector('#btnLogin');
const navCreate = document.querySelector('#navCreate');
const heroCreate = document.querySelector('#heroCreate');
const heroBrowse = document.querySelector('#heroBrowse');

// main function for loading page
function init() {
  const auth = getAuth();

// login/logout
 // if (auth.isAuthenticated) {
    btnLogin.textContent = 'Logout';
    btnLogin.onclick = () => {
      clearAuth();
      location.reload();
    };
 // } else {
 //   btnLogin.textContent = 'Logout';
 //   btnLogin.onclick = () => {
 //     location.href = '/login.html';
 //   };
 // }

  // Creat Event
navCreate?.addEventListener('click', (e) => {
    e.preventDefault();
    requireAuth('/create-event.html');
  });

  heroCreate?.addEventListener('click', (e) => {
    e.preventDefault();
    requireAuth('/create-event.html');
  });

  heroBrowse?.addEventListener('click', (e) => {
    e.preventDefault();
    requireAuth('/create-event.html');
  });
}

// run
init();*/
