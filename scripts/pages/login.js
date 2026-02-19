import { supabase } from '../config/supabase.js'; 
import { showModal } from '../utils/modal.js';

const form = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        console.log('Attempting login for:', email);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        console.log('Login successful!');
        console.log('User:', data.user.email);
        console.log('User ID:', data.user.id);

        showModal(
            'Welcome back to Campus Connect!',
            'Start exploring to find more events!',
            'success',
            {
                autoClose: 3000,
                onClose: () => {
                    window.location.href = '/pages/profile.html';
                }
            }
        )

    } catch (error) {
        console.error('Login error:', error.message);
        alert('Login failed: ' + error.message);
    }
});