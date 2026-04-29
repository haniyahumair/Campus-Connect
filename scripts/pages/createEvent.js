import { supabase } from '../config/supabase.js';
import { showModal } from '../utils/modal.js';
import { createNavbar } from '../components/navbarComponent.js';
import { createFooter } from '../components/footerComponent.js';
import { Loader } from 'https://cdn.jsdelivr.net/npm/@googlemaps/js-api-loader@1.16.6/+esm';

try {
  const headerEl = document.querySelector('header');
  const footerEl = document.querySelector('footer');
  if (headerEl) headerEl.innerHTML = createNavbar();
  if (footerEl) footerEl.innerHTML = createFooter();
} catch (err) {
  console.error('Navbar/Footer render failed:', err);
}

// map loader guard
let mapLoader = null;
const mapLoaderReady = (async () => {
  try {
    let apiKey = window?.GOOGLEMAP_API_KEY || window?.__GOOGLEMAP_API_KEY__;

    if (!apiKey) {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const cfg = await res.json();
          apiKey = cfg?.GOOGLEMAP_API_KEY;
        }
      } catch {}
    }

    if (!apiKey) {
      try {
        const env = await import('../config/env.js');
        apiKey = env?.GOOGLEMAP_API_KEY || env?.default?.GOOGLEMAP_API_KEY;
      } catch {}
    }

    if (apiKey) {
      mapLoader = new Loader({ apiKey, version: 'weekly' });
    } else {
      console.warn('Google Maps API key not found; map will be disabled.');
    }
  } catch (err) {
    console.warn('Could not initialize Google Maps:', err);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.create-events-form');

  // image preview
  const eventPhotoInput = document.getElementById('eventPhoto');
  if (eventPhotoInput) {
    eventPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const uploadArea = document.getElementById('uploadArea');
        if (!uploadArea) return;
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
  }

  // form submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('sumbitBtn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Creating...';
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          showModal("Error", "Please login!", "error", {
            autoClose: 3000,
            onClose: () => {
              window.location.href = "/pages/login.html";
            },
          });
          return;
        }

        const title = document.getElementById('eventName')?.value || '';
        const description = document.getElementById('aboutEvent')?.value || '';
        const date = document.getElementById('eventDate')?.value || '';
        const startTime = document.getElementById('eventStartTime')?.value || '';
        const endTime = document.getElementById('eventEndTime')?.value || '';
        const location = document.getElementById('location')?.value || '';
        const map = document.getElementById('Map')?.value || null;
        const priceInput = document.getElementById('price')?.value || '';
        const maxAttendees = document.getElementById('maxAttendees')?.value || '0';
        const eventType = document.getElementById('eventType')?.value || '';
        const contact = document.getElementById('eventContactInfo')?.value || '';
        const isFree = String(priceInput).toLowerCase().includes('free');
        const price = isFree ? 0 : parseFloat(String(priceInput).match(/\d+/)?.[0] || 0);

        // upload image
        const eventImage = document.getElementById('eventPhoto')?.files?.[0];
        let imageUrl = '/assets/Images/default-event.jpg';
        if (eventImage) {
          imageUrl = await uploadEventImage(eventImage, user.id);
        }

        const { data: newEvent, error } = await supabase.from('events').insert({
          title,
          description,
          location,
          venue_details: location,
          map_embed_url: map || null,
          date,
          start_time: startTime,
          end_time: endTime || null,
          max_capacity: parseInt(maxAttendees, 10) || 0,
          current_registration: 0,
          price,
          is_free: isFree,
          img_url: imageUrl,
          org_id: user.id,
          category: eventType,
          contact_details: contact,
          event_status: 'pending'
        }).select().single();

        if (error) throw error;
        const currentEventId = newEvent.id;

        // notify admin (best-effort)
        try {
          const { data: adminProfile } = await supabase.from('profiles').select('id').eq('is_admin', true).single();
          if (adminProfile?.id) {
            await supabase.from('notifications').insert({
              user_id: adminProfile.id,
              sender_id: user.id,
              event_id: currentEventId,
              message: `A new event "${newEvent.title}" was just created. Please review the event.`,
              is_read: false,
            });
          }
        } catch (err) {
          console.warn('Failed to notify admin:', err);
        }

        showModal(
          'Form Submitted',
          'Your event is under review and will be published within 24-48 hours. You can view your event in the "My Events" section in your profile.',
          'success',
          {
            autoClose: 3000,
            onClose: () => { window.location.href = '/pages/events.html'; }
          }
        );

      } catch (error) {
        console.error('Error creating event:', error);
        alert('Error: ' + (error.message || error));
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Create Event';
        }
      }
    });
  }

  (async () => {
    await mapLoaderReady;
    if (mapLoader) {
      try {
        await setupMap();
      } catch (err) {
        console.error('setupMap error:', err);
        const mapEl = document.getElementById('googleMap');
        if (mapEl) mapEl.innerHTML = '<p style="padding:16px;color:#666">Map failed to load.</p>';
      }
    } else {
      const mapEl = document.getElementById('googleMap');
      if (mapEl) mapEl.innerHTML = '<p style="padding:16px;color:#666">Map is unavailable.</p>';
    }
  })();
});

// image upload helper
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

    const { data: urlData } = await supabase.storage
      .from('event_image')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || '/assets/Images/default-event.jpg';
  } catch (error) {
    console.error('Event image upload error:', error);
    return '/assets/Images/default-event.jpg';
  }
}

function updateMapInput(marker) {
  const pos = marker.getPosition();
  const lat = pos.lat();
  const lng = pos.lng();
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&output=embed`;
  const mapInput = document.getElementById('Map');
  if (mapInput) mapInput.value = embedUrl;
}

async function setupMap() {
  if (!mapLoader) throw new Error('Map loader not initialized');
  try {
    const { Map } = await mapLoader.importLibrary('maps');
    const { Marker } = await mapLoader.importLibrary('marker');
    const { Autocomplete } = await mapLoader.importLibrary('places');
    const defaultPos = { lat: 25.2854, lng: 51.5310 };

    const mapEl = document.getElementById('googleMap');
    if (!mapEl) return;

    const map = new Map(mapEl, {
      center: defaultPos,
      zoom: 15,
    });

    const marker = new Marker({
      position: defaultPos,
      map: map,
      draggable: true,
      title: 'Event Location',
    });

    marker.addListener('dragend', () => updateMapInput(marker));

    const searchInput = document.getElementById('mapSearchInput');
    if (searchInput) {
      const autocomplete = new Autocomplete(searchInput);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        map.setCenter(place.geometry.location);
        map.setZoom(15);
        marker.setPosition(place.geometry.location);
        updateMapInput(marker);
      });
    }

  } catch (error) {
    console.error('Google Map failed to load:', error);
    throw error;
  }
}