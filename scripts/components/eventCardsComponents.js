export function createEventCard(event) {
    return `
    <div class="event-card">
            <div class="event-price">
                <p class="price">💵 ${event.price}</p>
            </div>

            <button class="save-event">
                <img src="${event.saveEvent}" class="before-heart-icon">
            </button>

            <img src="${event.image}" class="img-fluid" />
            <div class="p-3">
                <h5 class="event-title">${event.title}</h5>
                <p class="event-description">${event.description}</p>
                
                <!-- Date Container -->
                <div class="date-container">
                    <span class="date-emoji">📅</span>
                    <div class="date">
                        <span class="month">${event.month}</span>
                        <span class="day">${event.day}</span>
                        <span class="year">${event.year}</span>
                    </div>
                </div>

                <!-- Time Container -->
                <div class="time-container">
                    <span class="time-emoji">🕕</span>
                    <div class="time-details">
                        <span class="start-time">${event.start}</span>
                        <span class="time-separator"> - </span>
                        <span class="end-time">${event.end}</span>
                    </div>
                </div>

                <div class="location-of-event">
                    <span class="location-emoji">📍</span>
                    <p class="location">${event.location}</p>
                </div>
                
                <div class="attendees-bar">
                    <label style="font-weight: 700;">Attendees:</label>
                    <progress value="${event.attendees}" max="${event.capacity}"></progress>
                </div>

                <div class="type-of-event">
                    <button class="event-type">
                        <img src="/assets/Icons/Star 1.svg" alt="Star-Icon">
                        ${event.type}
                    </button>
                </div>
                
                <a class="btn btn-dark w-100 viewDetailBtn" data-id="${event.id}">View Details</a>
            </div>
        </div>`;
}