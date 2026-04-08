import { supabase } from '../config/supabase.js'
import { showModal } from '../utils/modal.js'
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';

document.querySelector('header').innerHTML = createNavbar();
document.querySelector('footer').innerHTML = createFooter();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.create-events-form');

    document.getElementById('eventPhoto').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const uploadArea = document.getElementById('uploadArea');
            const oldPreview = uploadArea.querySelector('.preview-image');
            if (oldPreview) oldPreview.remove();

            const preview = document.createElement('img');
            preview.src = event.target.result;
            preview.className = 'preview-image';
            
            uploadArea.appendChild(preview);
            uploadArea.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('sumbitBtn');
        btn.disabled = true;
        btn.textContent = 'Creating...';

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please login first');
                window.location.href = '/pages/login.html';
                return;
            }
            //form values
            const title = document.getElementById('eventName').value;
            const description = document.getElementById('aboutEvent').value;
            const date = document.getElementById('eventDate').value;
            const startTime = document.getElementById('eventStartTime').value;
            const endTime = document.getElementById('eventEndTime').value;
            const location = document.getElementById('location').value;
            const map = document.getElementById('Map').value;
            const priceInput = document.getElementById('price').value;
            const maxAttendees = document.getElementById('maxAttendees').value;
            const eventType = document.getElementById('eventType').value;
            const contact = document.getElementById('eventContactInfo').value;
            const isFree = priceInput.toLowerCase().includes('free');
            const price = isFree ? 0 : parseFloat(priceInput.match(/\d+/)?.[0] || 0);
            
            // Upload image
            const eventImage = document.getElementById('eventPhoto').files[0];
            let imageUrl = '/assets/Images/default-event.jpg';
            if (eventImage) {
                imageUrl = await uploadEventImage(eventImage, user.id);
            }

            //supabase upload
            const { error } = await supabase.from('events').insert({
                title,
                description,
                location,
                venue_details: location,
                map_embed_url: map || null,
                date,
                start_time: startTime,
                end_time: endTime || null,
                max_capacity: parseInt(maxAttendees),
                current_registration: 0,
                price,
                is_free: isFree,
                img_url: imageUrl,
                org_id: user.id,
                category: eventType,
                contact_details: contact,
                event_status: 'pending' // when created, event is pending review by admin
            });

            if (error) throw error;

            //send notification to admin about event being made
            const { data: admins, error: adminError} = await supabase
                .from('profiles')
                .select('user_id')
                .eq('is_admin', true)
                .eq('role', "admin")
                .single();

            if (adminError) {
                console.error('Error fetching admin user:', adminError);
                return;
            };

            if (!admins || !admins.user_id) {
                console.error('No admin user found');
                return;
            }

            const notificationToAdmin = admins.map(admin => ({  
                user_id: admin.user_id,
                sender_id: user.id,
                event_id: currentEventId,
                message: `A new event "${title}" has been created. Please review and approve it.`,
                is_read: false,
            }));

            const { error: notificationError } = await supabase
                .from('notifications')
                .insert(notificationToAdmin);

            if (notificationError) {
                console.error('Error sending notification to admin:', notificationError);
            }

            // Success popup
            showModal(
                'Form Submitted',
                'Your event is under review and will be published within 24-48 hours. You can view your event in the "My Events" section." in your profile.',
                'success',
                {
                    autoClose: 3000,
                    onClose: () => {
                        window.location.href = '/pages/events.html';
                    }
                }
            );

        } catch (error) {
            console.error('Error creating event:', error);
            alert('Error: ' + error.message);
            btn.disabled = false;
            btn.textContent = 'Create Event';
        }
    });
});

async function uploadEventImage(file, userId) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
            .from('event_image')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
            
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from('event_image')
            .getPublicUrl(fileName);
            
        return publicUrl;
    } catch (error) {
        console.error('Event image upload error:', error);
        return '/assets/Images/default-event.jpg';
    }
}