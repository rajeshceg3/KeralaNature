// Ensure the DOM is fully loaded before hiding the loading screen and initializing the map
document.addEventListener('DOMContentLoaded', function() {
    fetch('beaches.json')
        .then(response => response.json())
        .then(data => {
            beaches = data;
            loadMemories(); // Load memories from localStorage
            // Hide loading screen and initialize map
            document.getElementById('loadingScreen').classList.add('hidden');
            initializeMap(beaches); // Initialize the map after loading screen hides
        })
        .catch(error => {
            console.error('Error loading beach data:', error);
            const mapContainer = document.getElementById('map');
            mapContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%;
                           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                           color: white; text-align: center; padding: 2rem; border-radius: var(--border-radius-lg);">
                    <div>
                        <h3>🌊 Something Went Wrong</h3>
                        <p>We couldn't load the beach data. Please check your internet connection and try again.</p>
                        <button onclick="location.reload()" style="background: white; color: #667eea;
                               border: none; padding: 0.5rem 1rem; border-radius: 20px;
                               cursor: pointer; margin-top: 1rem; font-weight: 600; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">Refresh Page</button>
                    </div>
                </div>
            `;
        });
});

let beaches = [];

/**
 * Loads memories for all beaches from local storage.
 */
function loadMemories() {
    beaches.forEach(beach => {
        const storedMemories = localStorage.getItem(beach.name);
        if (storedMemories) {
            beach.memories = JSON.parse(storedMemories);
        }
    });
}

/**
 * Sanitizes a string to prevent XSS attacks.
 * @param {string} str - The string to sanitize.
 * @returns {string} The sanitized string.
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Adds a new memory to a beach and saves it to local storage.
 * @param {object} beach - The beach data object.
 */
function addMemory(beach) {
    const photoInput = document.getElementById('memory-photo-input');
    const noteInput = document.getElementById('memory-note-input');
    const file = photoInput.files[0];

    if (file && noteInput.value.trim() !== '') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newMemory = {
                photo: e.target.result,
                note: sanitizeHTML(noteInput.value)
            };
            beach.memories.push(newMemory);
            saveBeaches(beach);
            document.getElementById('memory-modal').style.display = 'none';
            photoInput.value = '';
            noteInput.value = '';
        };
        reader.readAsDataURL(file);
    } else {
        const errorElement = document.createElement('p');
        errorElement.textContent = 'Please select a photo and write a note.';
        errorElement.style.color = 'red';
        const form = document.getElementById('add-memory-form');
        form.appendChild(errorElement);
        setTimeout(() => {
            errorElement.remove();
        }, 3000);
    }
}

/**
 * Saves the beaches data to local storage.
 */
function saveBeaches(beach) {
    const memories = beach.memories;
    localStorage.setItem(beach.name, JSON.stringify(memories));
}

// Global error handling for JavaScript errors during map initialization
window.addEventListener('error', function(e) {
    console.error('Map initialization error:', e);
    const mapContainer = document.getElementById('map');
    // Display a user-friendly error message within the map container
    mapContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%;
                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                   color: white; text-align: center; padding: 2rem; border-radius: var(--border-radius-lg);">
            <div>
                <h3>🗺️ Map Loading Issue</h3>
                <p>We're having trouble loading the interactive map. Please refresh the page to try again.</p>
                <button onclick="location.reload()" style="background: white; color: #667eea;
                       border: none; padding: 0.5rem 1rem; border-radius: 20px;
                       cursor: pointer; margin-top: 1rem; font-weight: 600; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">Refresh Page</button>
            </div>
        </div>
    `;
});

// Optional: Service Worker registration for offline capabilities (requires sw.js file)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js') // Register the service worker
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
