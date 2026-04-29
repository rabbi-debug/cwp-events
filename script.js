document.addEventListener("DOMContentLoaded", function() {
    const root = document.getElementById('cwp-events-root');
    const csvUrl = root.getAttribute('data-sheet-url');

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSV(csvText);
            renderEvents(data);
        });

    function parseCSV(text) {
        const lines = text.split('\n').slice(1); // Skip header
        return lines.map(line => {
            const [Title, Date, Time, ImageURL, Description, Category, RSVP_Link, Status] = line.split(',');
            return { Title, Date, Time, ImageURL, Description, Category, RSVP_Link, Status: Status?.trim() };
        });
    }

    function renderEvents(events) {
        const today = new Date().toISOString().split('T')[0];
        const container = document.getElementById('cwp-events-root');
        
        // Filter: Must be Active and Today or Future
        const activeEvents = events.filter(e => 
            e.Status === 'Active' && e.Date >= today
        ).sort((a, b) => new Date(a.Date) - new Date(b.Date));

        if (activeEvents.length === 0) {
            container.innerHTML = "<p class='no-events'>Stay tuned! New events coming soon.</p>";
            return;
        }

        container.innerHTML = activeEvents.map(event => `
            <div class="event-card">
                <div class="event-image" style="background-image: url('${event.ImageURL}')">
                    <div class="date-badge">
                        <span class="month">${new Date(event.Date).toLocaleString('default', { month: 'short' })}</span>
                        <span class="day">${new Date(event.Date).getDate() + 1}</span>
                    </div>
                </div>
                <div class="event-content">
                    <span class="category-tag">${event.Category}</span>
                    <h2 class="event-title">${event.Title}</h2>
                    <p class="event-time"><i class="far fa-clock"></i> ${event.Time}</p>
                    <p class="event-desc">${event.Description}</p>
                    <div class="event-actions">
                        <a href="${event.RSVP_Link}" class="rsvp-btn">RSVP NOW</a>
                        <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=${event.Title}&dates=${event.Date.replace(/-/g, '')}" target="_blank" class="cal-btn">+ Add to Calendar</a>
                    </div>
                </div>
            </div>
        `).join('');
    }
});
