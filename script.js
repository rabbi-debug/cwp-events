document.addEventListener("DOMContentLoaded", function() {
    const root = document.getElementById('cwp-events-root');
    const csvUrl = root.getAttribute('data-sheet-url');

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = parseCSV(csvText);
            
            // Filter out the header row if it exists, and filter for Active/Future events
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const events = rows.filter(row => {
                // Skip if it's the header row or empty
                if (row[0] === 'Title' || row.length < 5) return false;
                
                const eventDate = new Date(row[1].replace(/-/g, '/'));
                const status = row[7] ? row[7].trim().toLowerCase() : '';
                
                return status === 'active' && eventDate >= today;
            }).sort((a, b) => new Date(a[1]) - new Date(b[1]));

            renderEvents(events);
        })
        .catch(err => { root.innerHTML = "Connection Error."; });

    // Robust CSV Parser that handles commas inside quotes
    function parseCSV(str) {
        const arr = [];
        let quote = false;
        for (let row = col = c = 0; c < str.length; c++) {
            let cc = str[c], nc = str[c+1];
            arr[row] = arr[row] || [];
            arr[row][col] = arr[row][col] || '';
            if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
            if (cc == '"') { quote = !quote; continue; }
            if (cc == ',' && !quote) { ++col; continue; }
            if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
            if (cc == '\n' && !quote) { ++row; col = 0; continue; }
            if (cc == '\r' && !quote) { ++row; col = 0; continue; }
            arr[row][col] += cc;
        }
        return arr;
    }

    function renderEvents(events) {
        if (events.length === 0) {
            root.innerHTML = "<div style='text-align:center; padding:50px; color:#666;'>No upcoming events found.</div>";
            return;
        }

        root.innerHTML = events.map(e => {
            const d = new Date(e[1].replace(/-/g, '/'));
            return `
                <div class="event-card">
                    <div class="event-image" style="background-image: url('${e[3]}')">
                        <div class="date-badge">
                            <span class="month">${d.toLocaleString('default', { month: 'short' })}</span>
                            <span class="day">${d.getDate()}</span>
                        </div>
                    </div>
                    <div class="event-content">
                        <span class="category-tag">${e[5]}</span>
                        <h2 class="event-title">${e[0]}</h2>
                        <div class="event-time">🕒 ${e[2]}</div>
                        <p class="event-desc">${e[4]}</p>
                        <div class="event-actions">
                            <a href="${e[6]}" class="rsvp-btn" target="_blank">RSVP NOW</a>
                            <a href="https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e[0])}&dates=${e[1].replace(/-/g, '')}/${e[1].replace(/-/g, '')}" target="_blank" class="cal-btn">+ Calendar</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
});
