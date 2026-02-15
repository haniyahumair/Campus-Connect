import { supabase } from '../config/supabase.js'
import { showModal } from '../utils/modal.js'

let selectedRole = 'student'

document.addEventListener('DOMContentLoaded', () => {
    setupRoleToggle()
    setupForm()
})

function setupRoleToggle() {
    const roleRadios = document.querySelectorAll('input[name="role"]')
    const studentFields = document.getElementById('studentFields')
    const adminFields = document.getElementById('adminFields')

    roleRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedRole = e.target.value
            
            if (selectedRole === 'student') {
                studentFields.style.display = 'block'
                adminFields.style.display = 'none'
                
                document.getElementById('student_id').required = true
                document.getElementById('major').required = true
                document.getElementById('year_of_study').required = true
                document.getElementById('department').required = false
            } else {
                studentFields.style.display = 'none'
                adminFields.style.display = 'block'
                
                document.getElementById('student_id').required = false
                document.getElementById('major').required = false
                document.getElementById('year_of_study').required = false
                document.getElementById('department').required = true
            }
        })
    })
}

function setupForm() {
    const form = document.getElementById('register-form')
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault()
        // Get the selected role from the radio button
        selectedRole = document.querySelector('input[name="role"]:checked').value
        const name = document.getElementById('name').value.trim()
        const email = document.getElementById('email').value.trim()
        const password = document.getElementById('password').value
        
        // Validate
        if (!name || !email || !password) {
            alert('Please fill in all required fields')
            return
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters')
            return
        }
        
        let userData = {
            full_name: name,
            role: selectedRole,
            is_admin: selectedRole === 'admin',
            admin_approved: false
        }
        
        if (selectedRole === 'student') {
            const studentId = document.getElementById('student_id').value.trim()
            const major = document.getElementById('major').value.trim()
            const yearOfStudy = document.getElementById('year_of_study').value
            const university = document.getElementById('university').value.trim()
            const bio = document.getElementById('bio').value.trim()
            const avatarFile = document.getElementById('avatar').files[0]

            //need to implement file upload correctly with supabase storage, for now using default avatar 
            //const avatarUrl = avatarFile ? await uploadAvatar(avatarFile) : null
            
            if (!studentId || !major || !yearOfStudy || !university) {
                alert('Please fill in all student fields')
                return
            }
            
            userData.student_id = studentId
            userData.major = major
            userData.year_of_study = parseInt(yearOfStudy)
            userData.university = university
            if (bio) userData.bio = bio
            userData.avatar_url = '/assets/Icons/userIcon.svg'
        } 
        
        else {
            const department = document.getElementById('department').value.trim()
            const adminBio = document.getElementById('admin_bio').value.trim()
            
            if (!department) {
                alert('Please enter your department/organization')
                return
            }
            
            userData.department = department
            if (adminBio) userData.bio = adminBio
        }
        
        // Disable submit button
        const submitBtn = form.querySelector('.btn-submit') || form.querySelector('.sign-up-btn')
        submitBtn.disabled = true
        const originalText = submitBtn.value || submitBtn.textContent
        if (submitBtn.tagName === 'INPUT') {
            submitBtn.value = 'Creating Account...'
        } else {
            submitBtn.textContent = 'Creating Account...'
        }
        
        try {
            console.log('Starting signup...', userData)
            //auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password
            })
            
            console.log('Auth response:', authData, authError)
            
            if (authError) throw authError
            
            if (!authData.user) {
                throw new Error('No user returned from signup')
            }
            
            console.log('User created:', authData.user.id)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: authData.user.id,
                    email: email,
                    ...userData
                }])
                .select()
            
            console.log('Profile response:', profileData, profileError)
            
            if (profileError) throw profileError
            // SUCCESS
            if (selectedRole === 'admin') {
                showModal(
                    'Admin Account Created!',
                    'Your admin account has been created successfully. Please wait for approval before you can access all features.',
                    'success',
                    {
                        autoClose: 3000,
                        onClose: () => {
                            window.location.href = '/pages/login.html'
                        }
                    }
                )
            } else {
                showModal(
                    'Welcome to Campus Connect!',
                    'Your account has been created successfully. You can now explore events and connect with your campus community!',
                    'success',
                    {
                        autoClose: 3000,
                        onClose: () => {
                            window.location.href = '/pages/login.html'
                        }
                    }
                )
            }
            
        } catch (error) {
            console.error('Signup error:', error)
            
            // Show user-friendly error messages
            let errorMessage = 'Failed to create account. '
            
            if (error.message.includes('already registered') || error.message.includes('already been registered')) {
                errorMessage = 'This email is already registered. Please login instead.'
            } else if (error.message.includes('duplicate key')) {
                if (error.message.includes('student_id')) {
                    errorMessage = 'This Student ID is already registered.'
                } else {
                    errorMessage = 'This email is already registered.'
                }
            } else if (error.message.includes('invalid email')) {
                errorMessage = 'Please enter a valid email address.'
            } else {
                errorMessage += error.message
            }
            
            alert(errorMessage)
            
            // Re-enable submit button
            submitBtn.disabled = false
            if (submitBtn.tagName === 'INPUT') {
                submitBtn.value = originalText
            } else {
                submitBtn.textContent = originalText
            }
        }
    })
}