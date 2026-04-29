document.addEventListener("DOMContentLoaded", function() {
    const root = document.getElementById('cwp-events-root');
    const csvUrl = root.getAttribute('data-sheet-url');

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split(/\r?\n/).slice(1);
            const events = lines.map(line => {
                // Regex to handle potential commas inside quotes in the CSV
                const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
                const clean = parts.map(p => p.replace(/^"|"$/g, '').trim());
                return {
                    Title: clean[0], Date: clean[1], Time: clean[2], ImageURL: clean[3],
                    Description: clean[4], Category: clean[5], Link: clean[6], Status: clean[7]
                };
            });
            renderEvents(events);
        })
        .catch(err => console.error("Error loading events:", err));

    function renderEvents(events) {
        const today = new Date().toISOString().split('T')[0];
        const activeEvents = events.filter(e => 
            e.Status === 'Active' && e.Date >= today
        ).sort((a, b) => new Date(a.Date) - new Date(b.Date));

        if (activeEvents.length === 0) {
            root.innerHTML = "<div style='text-align:center; padding:50px; color:#666;'>No upcoming events found. Check back soon!</div>";
            return;
        }

        root.innerHTML = activeEvents.map(event => {
            const d = new Date(event.Date + 'T00:00:00'); 
            const month = d.toLocaleString('default', { month: 'short' });
            const day = d.getDate();

            return `
                <div class="event-card">
                    <div class="event-image" style="background-image: url('${event.ImageURL}')">
                        <div class="date-badge">
                            <span class="month">${month}</span>
                            <span class="day">${day}</span>
                        </div>
                    </div>
                    <div class="event-content">
                        <span class="category-tag">${event.Category}</span>
                        <h2 class="event-title">${event.Title}</h2>
                        <div class="event-time">🕒 ${event.Time}</div>
                        <p class="event-desc">${event.Description}</p>
                        <div class="event-actions">
                            <a href="${event.Link}" class="rsvp-btn" target="_blank">RSVP NOW</a>
                            <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.Title)}&dates=${event.Date.replace(/-/g, '')}/${event.Date.replace(/-/g, '')}" target="_blank" class="cal-btn">+ Add to Calendar</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
});
