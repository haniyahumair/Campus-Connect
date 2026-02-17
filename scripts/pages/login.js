import { supabase } from '../config/supabase.js'; 
import { showModal } from '..utils/modal.js';

// basic form and inputs (email + password)
const form = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

form?.addEventListener('submit', async (e) => { // ← ADD 'async' HERE!
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // basic email + password validation
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        // Fetch profile data from the profiles table in Supabase.
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // save the auth session
        setAuth(data.user); 

        // redirection of the user back to home page
        showModal(
                    'Welcome back to Campus Connect!',
                    'Start exploring to find more events!',
                    'success',
                        {
                            autoClose: 3000,
                            onClose: () => {
                                window.location.href = '/pages/index.html'
                        }
                        }
                    )
        //const params = new URLSearchParams(location.search);
        //const target = params.get('returnTo') || 'index.html';

        // redirect the user after they login
        location.href = target;


        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});