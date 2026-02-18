import { supabase } from '../config/supabase.js'
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';
import { showModal} from '../utils/modal.js';

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile()
})

async function loadUserProfile() {
    showModal('Loading...', 'Please wait while we load your profile.', 'loading', 
        { 
            showButton: false,
         }
        
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
        alert('You must be logged in to view your profile.')
        window.location.href = '/pages/login.html'
        return
    }

    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error

        document.getElementById('profileName').textContent = profile.full_name
        document.getElementById('profileEmail').textContent = profile.email
        document.getElementById('profileRole').textContent = `🎓 ${profile.role}`
        document.getElementById('university').textContent = `🏫 ${profile.university}`
        document.getElementById('studentId').textContent = `🆔 ${profile.student_id}`
        document.getElementById('major').textContent = `📚 ${profile.major}`
        document.getElementById('yearOfStudy').textContent = `📅 Year ${profile.year_of_study}`
        document.getElementById('bioText').textContent = profile.bio || 'No bio available.'
        document.getElementById('profileAvatar').src = profile.avatar_url || '/assets/Icons/user-Icon.svg'

        closeModal()
        document.getElementById('profileContent').style.display = 'block'
        document.querySelector('.upcoming-events-header').style.display = 'block'
        document.querySelector('.my-events-header').style.display = 'block'
    }

    catch (error) {
        console.error('Error loading profile:', error)
        alert('Failed to load profile. Please try again later.')
    }
}

const signOutBtn = document.getElementById('signOutBtn')

signOutBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    
    try {
        const { error } = await supabase.auth.signOut()
        
        if (error) throw error
        window.location.href = '/pages/login.html'
        
    } catch (error) {
        console.error('Sign out error:', error)
        alert('Failed to sign out. Please try again.')
    }
})