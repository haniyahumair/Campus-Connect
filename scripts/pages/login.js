// login.js
import { setAuth } from './auth.js';

// basic form and inputs (email + password)
const form = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // basic email + password validation
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    // Fetch profile data from the profiles table in Supabase.
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    // save the auth session
    setAuth(user);

    // redirection of the user back to home page
    const params = new URLSearchParams(location.search);
    const target = params.get('returnTo') || '/home.html';

    // redirect the user after they login
    location.href = target;
});
