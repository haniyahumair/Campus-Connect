import { supabase } from '../config/supabase.js'

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile()
})

async function loadUserProfile() {
    // FIX: Add await and destructure properly
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
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
        document.getElementById('profileUniversity').textContent = `🏫 ${profile.university}`
        document.getElementById('studentId').textContent = `🆔 ${profile.student_id}`
        document.getElementById('major').textContent = `📚 ${profile.major}`
        document.getElementById('yearOfStudy').textContent = `📅 Year ${profile.year_of_study}`
        document.getElementById('profileBio').textContent = profile.bio || 'No bio available.'
        document.getElementById('profileAvatar').src = profile.avatar_url || '/assets/Icons/user-Icon.svg'
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