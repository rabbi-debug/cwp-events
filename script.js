document.addEventListener("DOMContentLoaded", function() {
    const root = document.getElementById('cwp-events-root');
    const csvUrl = root.getAttribute('data-sheet-url');

    console.log("DEBUG: Starting fetch from:", csvUrl);

    fetch(csvUrl)
        .then(response => response.text())
        .then(csvText => {
            console.log("DEBUG: Raw CSV Text received:", csvText);
            
            // Simple split by line
            const rows = csvText.split(/\r?\n/).filter(row => row.trim() !== "");
            
            const events = rows.slice(1).map(row => {
                // Extremely simple split by comma
                const clean = row.split(',').map(v => v.replace(/^"|"$/g, '').trim());
                return {
                    Title: clean[0], Date: clean[1], Time: clean[2], ImageURL: clean[3],
                    Description: clean[4], Category: clean[5], Link: clean[6], Status: clean[7]
                };
            });

            // FORCE RENDER EVERYTHING (Ignoring Date and Status for now)
            renderEvents(events);
        })
        .catch(err => {
            root.innerHTML = "Error: " + err;
        });

    function renderEvents(events) {
        if (events.length === 0) {
            root.innerHTML = "Sheet was found, but it appears to be empty.";
            return;
        }

        root.innerHTML = "<h3>Debug Mode: Showing All Rows Found</h3>" + events.map(event => `
            <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; background:#fff;">
                <strong>Title:</strong> ${event.Title} <br>
                <strong>Date:</strong> ${event.Date} <br>
                <strong>Status:</strong> ${event.Status}
            </div>
        `).join('');
    }
});
