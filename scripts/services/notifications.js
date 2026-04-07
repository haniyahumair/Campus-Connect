import { supabase } from '../config/supabase.js';

let currentUserId = null;

export async function initNotifications() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  currentUserId = session.user.id;

  // show the bell now that user is logged in
  const bell = document.getElementById('notifBell');
  if (bell) bell.style.display = 'flex';

  // load existing unread notifications
  await loadNotifications();

  // listen for new notifications in realtime
  supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUserId}`,
      },
      (payload) => {
        addNotificationToDropdown(payload.new);
        incrementBadge();
      }
    )
    .subscribe();

  // toggle dropdown on bell click
  document.getElementById('bellBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('notifDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });

  // close dropdown when clicking outside
  document.addEventListener('click', () => {
    const dropdown = document.getElementById('notifDropdown');
    if (dropdown) dropdown.style.display = 'none';
  });
}

async function loadNotifications() {
  const { data: notifs } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', currentUserId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!notifs || notifs.length === 0) return;

  const unreadCount = notifs.filter(n => !n.is_read).length;
  updateBadge(unreadCount);

  const list = document.getElementById('notifList');
  if (!list) return;

  list.innerHTML = '';
  notifs.forEach(n => addNotificationToDropdown(n));
}

function addNotificationToDropdown(notif) {
  const list = document.getElementById('notifList');
  if (!list) return;

  // Remove empty state
  const empty = list.querySelector('.notif-empty');
  if (empty) empty.remove();

  const item = document.createElement('div');
  item.className = `notif-item ${notif.is_read ? '' : 'unread'}`;
  item.dataset.id = notif.id;
  item.innerHTML = `
    <p class="notif-msg">${notif.message}</p>
    <span class="notif-time">${timeAgo(notif.created_at)}</span>
    <p class="read-notif" style="font-size: 0.8rem; text-decoration: underline; color: #666;">Read</p>
  `;

  // Attach event listener to the "Read" button
  const readNotif = item.querySelector('.read-notif');
  readNotif.addEventListener('click', async () => {
    item.classList.remove('unread'); 
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notif.id);

    // Redirect to events page
    window.location.href = '/pages/events.html';
  });

  list.prepend(item);
}

function incrementBadge() {
  const badge = document.getElementById('bellBadge');
  if (!badge) return;
  const current = parseInt(badge.textContent) || 0;
  updateBadge(current + 1);
}

function updateBadge(count) {
  const badge = document.getElementById('bellBadge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function timeAgo(timestamp) {
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}