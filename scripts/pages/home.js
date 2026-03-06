// imports
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();
