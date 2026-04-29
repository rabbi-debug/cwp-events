document.addEventListener("DOMContentLoaded", function() {
    const root = document.getElementById('cwp-events-root');
    const csvUrl = root.getAttribute('data-sheet-url');

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            // Updated parser to handle commas and quotes better
            const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== "");
            const headers = rows[0].split(',');
            
            const events = rows.slice(1).map(row => {
                // This regex splits by comma but ignores commas inside quotes
                const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
                const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
                
                return {
                    Title: cleanValues[0],
                    Date: cleanValues[1],
                    Time: cleanValues[2],
                    ImageURL: cleanValues[3],
                    Description: cleanValues[4],
                    Category: cleanValues[5],
                    Link: cleanValues[6],
                    Status: cleanValues[7]
                };
            });

            console.log("All Events found in Sheet:", events); // For Debugging
            renderEvents(events);
        })
        .catch(err => {
            root.innerHTML = "Error connecting to Google Sheets.";
            console.error(err);
        });

    function renderEvents(events) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison

        const activeEvents = events.filter(e => {
            if (!e.Date || !e.Status) return false;
            
            const eventDate = new Date(e.Date.includes('-') ? e.Date : e.Date.replace(/\//g, '-'));
            const isActive = e.Status.trim().toLowerCase() === 'active';
            const isFuture = eventDate >= today;
            
            return isActive && isFuture;
        }).sort((a, b) => new Date(a.Date) - new Date(b.Date));

        if (activeEvents.length === 0) {
            root.innerHTML = "<div style='text-align:center; padding:50px; color:#666;'>No upcoming events found. Check your Sheet for 'Active' status and future dates!</div>";
            return;
        }

        root.innerHTML = activeEvents.map(event => {
            // Create a nice display date
            const d = new Date(event.Date.replace(/-/g, '/')); 
            const month = d.toLocaleString('default', { month: 'short' });
            const day = d.getDate();

            return `
                <div class="event-card">
                    <div class="event-image" style="background-image: url('${event.ImageURL || ''}')">
                        <div class="date-badge">
                            <span class="month">${month}</span>
                            <span class="day">${day}</span>
                        </div>
                    </div>
                    <div class="event-content">
                        <span class="category-tag">${event.Category || 'Event'}</span>
                        <h2 class="event-title">${event.Title}</h2>
                        <div class="event-time">🕒 ${event.Time}</div>
                        <p class="event-desc">${event.Description}</p>
                        <div class="event-actions">
                            <a href="${event.Link}" class="rsvp-btn" target="_blank">RSVP NOW</a>
                            <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.Title)}&dates=${event.Date.replace(/-/g, '')}/${event.Date.replace(/-/g, '')}" target="_blank" class="cal-btn">+ Calendar</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
});
