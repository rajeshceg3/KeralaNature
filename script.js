// Ensure the DOM is fully loaded before hiding the loading screen and initializing the map
document.addEventListener('DOMContentLoaded', function() {
    fetch('beaches.json')
        .then(response => response.json())
        .then(data => {
            beaches = data;
            loadMemories(); // Load memories from localStorage
            loadItinerary(); // Load itinerary from localStorage

            // Hide loading screen and initialize map
            document.getElementById('loadingScreen').classList.add('hidden');
            initializeMap(beaches); // Initialize the map after loading screen hides
            renderBeachList(beaches); // Populate the sidebar list (Desktop)
            renderItineraryList(); // Populate itinerary list
        })
        .catch(error => {
            console.error('Error loading beach data:', error);
            // Ensure loading screen is hidden so error is visible
            document.getElementById('loadingScreen').classList.add('hidden');
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

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            // Filter beaches
            const filteredBeaches = beaches.filter(beach =>
                beach.name.toLowerCase().includes(searchTerm) ||
                beach.description.toLowerCase().includes(searchTerm)
            );

            // Update UI
            renderBeachList(filteredBeaches);

            // Update Map Markers
            // We need to access markers from map.js. Assuming beachMarkers is global or accessible.
            // Since beachMarkers is defined in map.js (which is loaded before script.js usually, but let's check order),
            // actually map.js is loaded BEFORE script.js in index.html, so global vars might be available if not scoped.
            // Let's check map.js scope. It uses 'let beachMarkers = []' at top level.
            if (typeof beachMarkers !== 'undefined') {
                beachMarkers.forEach(marker => {
                    const isVisible = marker.beachData.name.toLowerCase().includes(searchTerm) ||
                                      marker.beachData.description.toLowerCase().includes(searchTerm);

                    if (isVisible) {
                        if (!map.hasLayer(marker)) {
                            marker.addTo(map);
                        }
                    } else {
                        if (map.hasLayer(marker)) {
                            map.removeLayer(marker);
                        }
                    }
                });
            }
        });
    }
});

let beaches = [];
let itinerary = [];

/**
 * Loads memories for all beaches from local storage.
 */
function loadMemories() {
    beaches.forEach(beach => {
        const storedMemories = localStorage.getItem(beach.name);
        if (storedMemories) {
            try {
                const parsed = JSON.parse(storedMemories);
                // Validate that it's an array as expected
                if (Array.isArray(parsed)) {
                    beach.memories = parsed;
                } else {
                    console.warn(`Invalid memory format for ${beach.name}, expected array.`);
                    beach.memories = [];
                }
            } catch (e) {
                console.error(`Error parsing memories for ${beach.name}:`, e);
                // Graceful recovery: start fresh for this beach
                beach.memories = [];
                // Optional: clear the corrupted data
                // localStorage.removeItem(beach.name);
            }
        }
    });
}

/**
 * Loads itinerary from local storage.
 */
function loadItinerary() {
    const storedItinerary = localStorage.getItem('kerala_beach_itinerary');
    if (storedItinerary) {
        try {
            itinerary = JSON.parse(storedItinerary);
        } catch (e) {
            console.error('Error parsing itinerary:', e);
            itinerary = [];
        }
    }
}

/**
 * Saves itinerary to local storage.
 */
function saveItinerary() {
    localStorage.setItem('kerala_beach_itinerary', JSON.stringify(itinerary));
    renderItineraryList();
}

/**
 * Toggles a beach in the itinerary.
 * @param {string} beachName - The name of the beach.
 */
function toggleItinerary(beachName) {
    const index = itinerary.indexOf(beachName);
    if (index === -1) {
        itinerary.push(beachName);
        // Show feedback (could be a toast, but using alert for now or just UI update)
    } else {
        itinerary.splice(index, 1);
    }
    saveItinerary();

    // Update button text if popup is open
    const btn = document.querySelector('.itinerary-btn');
    if (btn) {
        const isInItinerary = itinerary.includes(beachName);
        btn.textContent = isInItinerary ? 'Remove from Itinerary' : 'Add to Itinerary';
        btn.classList.toggle('active', isInItinerary);
    }
}

/**
 * Renders the itinerary list in the sidebar.
 */
function renderItineraryList() {
    const container = document.getElementById('itinerary-container');
    const list = document.getElementById('itinerary-list');

    if (!container || !list) return;

    if (itinerary.length === 0) {
        container.style.display = 'none';
        list.innerHTML = '';
        return;
    }

    container.style.display = 'block';
    list.innerHTML = '';

    itinerary.forEach(beachName => {
        const beach = beaches.find(b => b.name === beachName);
        if (!beach) return;

        const item = document.createElement('div');
        item.className = `beach-card ${beach.type}`;
        item.style.marginBottom = '0.5rem';
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.innerHTML = `
            <div class="item-icon"></div>
            <div class="card-content">
                <span class="item-name">${sanitizeHTML(beach.name)}</span>
            </div>
            <button class="remove-itinerary-btn" style="background:none; border:none; cursor:pointer; color:var(--text-light); margin-left:auto;" aria-label="Remove ${beach.name} from itinerary">
                <i class="ph ph-x"></i>
            </button>
        `;

        // Click to fly to beach
        item.addEventListener('click', (e) => {
            if (e.target.closest('.remove-itinerary-btn')) return;

            if (window.innerWidth > 768 && map) {
                map.flyTo([beach.lat, beach.lng], 14, { animate: true, duration: 1.5 });
                map.once('moveend', () => {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker && layer.options.title === beach.name) {
                            layer.openPopup();
                        }
                    });
                });
            } else if (window.innerWidth <= 768) {
                // Mobile behavior
                 map.eachLayer((layer) => {
                    if (layer instanceof L.Marker && layer.options.title === beach.name) {
                        // Trigger click logic manually since marker might be hidden or far
                        // Actually we should just call the open logic
                        // But map.js encapsulates it. Let's rely on finding the marker.
                        layer.fire('click');
                    }
                });
            }
        });

        // Remove button
        item.querySelector('.remove-itinerary-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleItinerary(beach.name);
        });

        list.appendChild(item);
    });
}

/**
 * Generates a mock weather object based on location.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @returns {object} Weather object { temp: number, condition: string, icon: string }
 */
function getWeather(lat, lng) {
    // Deterministic pseudo-random based on lat/lng to be consistent per reload
    const seed = lat + lng;
    const tempBase = 28; // Average Kerala temp
    const tempVar = (Math.sin(seed * 100) * 3); // +/- 3 degrees
    const temp = Math.round(tempBase + tempVar);

    const conditions = [
        { text: 'Sunny', icon: 'ph-sun' },
        { text: 'Partly Cloudy', icon: 'ph-cloud-sun' },
        { text: 'Breezy', icon: 'ph-wind' }
    ];

    const condIndex = Math.abs(Math.floor(Math.sin(seed * 1000) * conditions.length)) % conditions.length;

    return {
        temp: temp,
        condition: conditions[condIndex].text,
        icon: conditions[condIndex].icon
    };
}


/**
 * Resizes an image file to a maximum dimension and returns a base64 string.
 * @param {File} file - The image file to resize.
 * @param {number} maxDim - The maximum width or height.
 * @param {number} quality - JPEG quality (0 to 1).
 * @returns {Promise<string>} A promise that resolves to the data URL.
 */
function resizeImage(file, maxDim, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxDim) {
                        height *= maxDim / width;
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width *= maxDim / height;
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
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
        resizeImage(file, 800, 0.7)
            .then(resizedImage => {
                const newMemory = {
                    photo: resizedImage,
                    note: sanitizeHTML(noteInput.value)
                };
                beach.memories.push(newMemory);

                try {
                    saveBeaches(beach);

                    // Close with animation
                    const modal = document.getElementById('memory-modal');
                    const content = modal.querySelector('.memory-modal-content');
                    modal.style.opacity = '0';
                    content.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        modal.style.display = 'none';
                    }, 300);

                    photoInput.value = '';
                    noteInput.value = '';
                } catch (error) {
                    console.error('Storage failed:', error);
                    alert('Failed to save memory. Your local storage might be full.');
                    beach.memories.pop(); // Revert
                }
            })
            .catch(error => {
                console.error('Image processing failed:', error);
                alert('Failed to process image. Please try another one.');
            });
    } else {
        const errorElement = document.createElement('p');
        errorElement.textContent = 'Please select a photo and write a note.';
        errorElement.style.color = 'red';
        errorElement.style.marginTop = '10px';
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
