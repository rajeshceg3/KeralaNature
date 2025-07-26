// Ensure the DOM is fully loaded before hiding the loading screen and initializing the map
document.addEventListener('DOMContentLoaded', function() {
    loadBeaches(); // Load beaches from local storage
    // Simulate a loading delay for better user experience
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        initializeMap(); // Initialize the map after loading screen hides
    }, 2000); // 2 seconds delay
});

let beaches = [];

/**
 * Initializes the Leaflet map and adds all beach markers.
 */
function initializeMap() {
    // Initialize the map centered on Kerala with a specific zoom level
    const map = L.map('map', {
        zoomControl: false, // Disable default zoom control to add custom one
        attributionControl: false, // Disable default attribution
        fadeAnimation: true, // Smooth fade animations for map tiles
        zoomAnimation: true, // Smooth zoom animations
        markerZoomAnimation: true // Smooth marker zoom animations
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 9);
            },
            () => {
                map.setView([10.8505, 76.2711], 7); // Default to Kerala
            }
        );
    } else {
        map.setView([10.8505, 76.2711], 7); // Default to Kerala
    }

    // Add custom zoom control to the top right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Add OpenStreetMap tile layer with attribution and opacity
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        opacity: 0.8,
        className: 'custom-tiles' // Custom class for potential future styling
    }).addTo(map);

    // Define color scheme for different beach types
    const beachColors = {
        popular: '#f093fb', // Pinkish-purple
        serene: '#4facfe',  // Light blue
        adventure: '#fa709a' // Orangish-pink
    };

    /**
     * Creates a custom HTML icon for Leaflet markers based on beach type.
     * @param {string} type - The type of beach (popular, serene, adventure).
     * @returns {L.DivIcon} A Leaflet DivIcon object.
     */
    function createCustomIcon(type) {
        const color = beachColors[type];
        return L.divIcon({
            className: 'custom-marker', // Class for CSS styling and animations
            html: `
                <div style="
                    background: linear-gradient(135deg, ${color} 0%, ${color}aa 100%);
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    position: relative;
                    animation: markerPulse 3s infinite ease-in-out, bloom 4s infinite alternate;
                ">
                    🏖️ <!-- Beach emoji as icon -->
                </div>
            `,
            iconSize: [36, 36], // Size of the icon
            iconAnchor: [18, 18], // Point of the icon which will correspond to marker's location
            popupAnchor: [0, -20] // Point from which the popup should open relative to the iconAnchor
        });
    }

    /**
     * Generates a string of star characters based on a given rating.
     * @param {number} rating - The numerical rating (e.g., 4.5).
     * @returns {string} A string of full and half star characters.
     */
    function getStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0; // Check for a fractional part
        let stars = '';

        for (let i = 0; i < fullStars; i++) {
            stars += '★'; // Full star
        }
        if (hasHalfStar) {
            stars += '☆'; // Half star (using an empty star for visual representation)
        }

        return stars;
    }

    /**
     * Creates the HTML content for a beach's popup.
     * @param {object} beach - The beach data object.
     * @returns {string} HTML string for the popup content.
     */
    function createPopupContent(beach) {
        const stars = getStarRating(beach.rating);
        // Map features array to feature tags
        const features = beach.features.map(feature =>
            `<span class="feature-tag">${feature}</span>`
        ).join(''); // Join them into a single string

        return `
            <div class="beach-popup">
                <div class="popup-header">
                    <h3>${beach.name}</h3>
                </div>
                <div class="popup-content">
                    <p>${beach.description}</p>
                    <div class="beach-features">
                        ${features}
                    </div>
                    <div class="beach-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-text">${beach.rating}/5 (${beach.reviews} reviews)</span>
                    </div>
                    <div class="beach-actions">
                        <button class="action-btn add-memory-btn">Add Memory</button>
                        <button class="action-btn view-memories-btn">View Memories</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Iterate over each beach and add a marker to the map
    beaches.forEach((beach, index) => {
        const marker = L.marker([beach.lat, beach.lng], {
            icon: createCustomIcon(beach.type), // Use custom icon based on beach type
            title: beach.name, // Title for accessibility and hover
            alt: `${beach.name} beach location` // Alt text for accessibility
        }).addTo(map);

        // Create a popup for the marker with enhanced styling
        const popup = L.popup({
            maxWidth: 400,
            minWidth: 320,
            closeButton: true,
            className: 'custom-popup' // Custom class for popup styling
        }).setContent(createPopupContent(beach));

        marker.bindPopup(popup); // Bind the popup to the marker

        // Add mouseover event to open popup on hover
        marker.on('mouseover', function(e) {
            this.openPopup();
        });

        // Add click event for logging (can be extended for analytics)
        marker.on('click', function(e) {
            console.log(`Beach clicked: ${beach.name}`);
        });

        marker.on('popupopen', function() {
const addMemoryBtn = this.getPopup().getElement().querySelector('.add-memory-btn');
const viewMemoriesBtn = this.getPopup().getElement().querySelector('.view-memories-btn');

            if (addMemoryBtn) {
                addMemoryBtn.onclick = () => showMemoryModal(beach);
            }

            if (viewMemoriesBtn) {
                viewMemoriesBtn.onclick = () => showPhotoGallery(beach);
            }
        });

        // Animate marker appearance with a staggered delay
        setTimeout(() => {
            // Ensure the element exists before trying to access its style
            if (marker.getElement()) {
                marker.getElement().style.animation = 'markerPulse 3s infinite ease-in-out';
            }
        }, index * 200); // Staggered animation delay
    });

    // Add interaction for legend items
    const legendItems = document.querySelectorAll('.legend-item');
    legendItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.querySelector('.legend-text').textContent;
            console.log(`Legend clicked: ${category}`);
            // Future enhancement: Filter markers on the map based on category
        });

        // Add keyboard accessibility for legend items (Enter/Space to activate)
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); // Prevent default scroll behavior for spacebar
                this.click(); // Trigger click event
            }
        });
    });

    // Add map interaction enhancements based on zoom level
    map.on('zoomend', function() {
        const currentZoom = map.getZoom();
        const markers = document.querySelectorAll('.custom-marker');
        markers.forEach(marker => {
            // Scale markers based on zoom level for better visibility
            const scale = Math.min(1 + (currentZoom - 7) * 0.1, 1.5); // Max scale 1.5
            marker.style.transform = `scale(${scale})`;
        });
    });

    // Add keyboard navigation for the map (arrow keys for pan, +/- for zoom)
    map.on('focus', function() {
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'ArrowUp':
                    map.panBy([0, -50]); // Pan up
                    break;
                case 'ArrowDown':
                    map.panBy([0, 50]); // Pan down
                    break;
                case 'ArrowLeft':
                    map.panBy([-50, 0]); // Pan left
                    break;
                case 'ArrowRight':
                    map.panBy([50, 0]); // Pan right
                    break;
                case '+':
                case '=': // Both + and = for zoom in
                    map.zoomIn();
                    break;
                case '-':
                    map.zoomOut();
                    break;
            }
        });
    });

    // Add accessibility attributes to the map container
    const mapContainer = document.getElementById('map');
    mapContainer.setAttribute('tabindex', '0'); // Make map focusable
    mapContainer.setAttribute('role', 'application'); // Indicate it's an interactive application
    mapContainer.setAttribute('aria-label', 'Interactive map of Kerala beaches. Use arrow keys to navigate, + and - to zoom.');

    // Log when the map is fully loaded
    map.whenReady(function() {
        console.log('Map fully loaded with all beaches');

        // Add subtle entrance animation to all markers after map is ready
        setTimeout(() => {
            const markers = document.querySelectorAll('.custom-marker');
            markers.forEach((marker, index) => {
                setTimeout(() => {
                    // Reapply a specific animation for entrance, overriding initial pulse if needed
                    marker.style.animation = 'popupSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                }, index * 100);
            });
        }, 500); // Delay before starting marker entrance animations
    });

    /**
     * Handles window resize events to invalidate map size and adjust info panel position.
     */
    function handleResize() {
        map.invalidateSize(); // Recalculate map size when container changes

        // Adjust info panel position for mobile responsiveness
        const infoPanel = document.querySelector('.info-panel');
        if (window.innerWidth <= 768) { // For screens smaller than or equal to 768px
            infoPanel.style.position = 'relative';
            infoPanel.style.top = 'auto';
            infoPanel.style.right = 'auto';
        } else { // For larger screens
            infoPanel.style.position = 'absolute';
            infoPanel.style.top = '20px';
            infoPanel.style.right = '20px';
        }
    }

    // Attach resize event listener
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call to set correct position on load

    // Add performance monitoring using PerformanceObserver API
    const performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
                console.log(`${entry.name}: ${entry.startTime}ms`); // Log paint timings
            }
        });
    });

    performanceObserver.observe({ entryTypes: ['paint'] }); // Observe paint events

} // End of initializeMap function

/**
 * Shows the photo gallery for a given beach.
 * @param {object} beach - The beach data object.
 */
function showPhotoGallery(beach) {
    const galleryModal = document.getElementById('photo-gallery');
    const galleryPhotos = document.getElementById('gallery-photos');
    const closeGallery = document.querySelector('.close-gallery');

    galleryPhotos.innerHTML = ''; // Clear previous photos

    if (beach.memories.length === 0) {
        galleryPhotos.innerHTML = '<p>No memories yet. Add one!</p>';
    } else {
        beach.memories.forEach(memory => {
            const img = document.createElement('img');
            img.src = memory.photo;
            img.alt = memory.note;
            img.className = 'gallery-photo';
            galleryPhotos.appendChild(img);
        });
    }

    galleryModal.style.display = 'block';

    closeGallery.onclick = () => {
        galleryModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == galleryModal) {
            galleryModal.style.display = 'none';
        }
    };
}

/**
 * Shows the modal for adding a new memory.
 * @param {object} beach - The beach data object.
 */
function showMemoryModal(beach) {
    const memoryModal = document.getElementById('memory-modal');
    const closeMemoryModal = document.querySelector('.close-memory-modal');
    const addMemoryForm = document.getElementById('add-memory-form');

    memoryModal.style.display = 'block';

    addMemoryForm.onsubmit = (event) => {
        event.preventDefault();
        addMemory(beach);
    };

    closeMemoryModal.onclick = () => {
        memoryModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == memoryModal) {
            memoryModal.style.display = 'none';
        }
    };
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
                note: noteInput.value
            };
            beach.memories.push(newMemory);
            saveBeaches();
            document.getElementById('memory-modal').style.display = 'none';
            photoInput.value = '';
            noteInput.value = '';
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please select a photo and write a note.');
    }
}

/**
 * Saves the beaches data to local storage.
 */
function saveBeaches() {
    localStorage.setItem('keralaBeaches', JSON.stringify(beaches));
}

/**
 * Loads the beaches data from local storage.
 */
function loadBeaches() {
    const storedBeaches = localStorage.getItem('keralaBeaches');
    if (storedBeaches) {
        beaches = JSON.parse(storedBeaches);
    } else {
        beaches = [
            {
                name: "Kovalam Beach",
                lat: 8.4004,
                lng: 76.9784,
                type: "popular",
                description: "Famous for its crescent-shaped coastline and iconic lighthouse, Kovalam is Kerala's crown jewel of beach tourism.",
                features: ["Lighthouse", "Ayurvedic Spas", "Surfing", "Fine Dining"],
                rating: 4.7,
                reviews: 2847,
                memories: []
            },
            {
                name: "Varkala Beach",
                lat: 8.7379,
                lng: 76.7161,
                type: "serene",
                description: "Known as Papanasam Beach, this cliff-top paradise offers breathtaking views and natural mineral springs with healing properties.",
                features: ["Cliff Views", "Mineral Springs", "Yoga Retreats", "Sunset Cafes"],
                rating: 4.6,
                reviews: 1923,
                memories: []
            },
            {
                name: "Alleppey Beach",
                lat: 9.4981,
                lng: 76.3388,
                type: "popular",
                description: "Gateway to the enchanting backwaters, this beach perfectly combines coastal beauty with serene lagoon experiences.",
                features: ["Backwaters", "Houseboats", "Historic Pier", "Lighthouse"],
                rating: 4.5,
                reviews: 3156,
                memories: []
            },
            {
                name: "Cherai Beach",
                lat: 10.1102,
                lng: 76.1785,
                type: "serene",
                description: "A pristine stretch of golden sand with calm waters, perfect for swimming and peaceful contemplation.",
                features: ["Golden Sand", "Swimming", "Backwaters", "Paddy Fields"],
                rating: 4.4,
                reviews: 1567,
                memories: []
            },
            {
                name: "Marari Beach",
                lat: 9.6089,
                lng: 76.2833,
                type: "serene",
                description: "An untouched paradise with swaying palms and pristine waters, offering the perfect escape from urban life.",
                features: ["Pristine Waters", "Coconut Groves", "Fishing Village", "Peaceful"],
                rating: 4.8,
                reviews: 1234,
                memories: []
            },
            {
                name: "Bekal Beach",
                lat: 12.3915,
                lng: 75.0337,
                type: "adventure",
                description: "Home to the magnificent Bekal Fort, this beach combines historical grandeur with natural beauty.",
                features: ["Historic Fort", "Archaeology", "Photography", "Trekking"],
                rating: 4.6,
                reviews: 2087,
                memories: []
            },
            {
                name: "Kannur Beach",
                lat: 11.8745,
                lng: 75.3704,
                type: "popular",
                description: "Known for its cultural richness and pristine coastline, offering a perfect blend of tradition and natural beauty.",
                features: ["Cultural Sites", "Clean Waters", "Local Cuisine", "Theyyam"],
                rating: 4.3,
                reviews: 1456,
                memories: []
            },
            {
                name: "Muzhappilangad Beach",
                lat: 11.7833,
                lng: 75.3167,
                type: "adventure",
                description: "Kerala's longest drive-in beach, where you can literally drive on the sand and enjoy unique beach experiences.",
                features: ["Drive-in Beach", "Adventure Sports", "Unique Experience", "Photography"],
                rating: 4.5,
                reviews: 1789,
                memories: []
            },
            {
                name: "Kappad Beach",
                lat: 11.3889,
                lng: 75.7194,
                type: "serene",
                description: "Historic beach where Vasco da Gama first landed in India, combining historical significance with natural beauty.",
                features: ["Historical Site", "Vasco da Gama", "Rock Formations", "Peaceful"],
                rating: 4.2,
                reviews: 1123,
                memories: []
            },
            {
                name: "Payyambalam Beach",
                lat: 11.8833,
                lng: 75.3667,
                type: "popular",
                description: "A beautiful beach with a well-maintained park, perfect for families and evening strolls.",
                features: ["Beach Park", "Family Friendly", "Sculptures", "Evening Walks"],
                rating: 4.4,
                reviews: 1334,
                memories: []
            },
            {
                name: "Kizhunna Beach",
                lat: 11.7833,
                lng: 75.3333,
                type: "serene",
                description: "A hidden gem with black rocks and clear waters, offering a unique and tranquil beach experience.",
                features: ["Black Rocks", "Clear Waters", "Secluded", "Photography"],
                rating: 4.5,
                reviews: 892,
                memories: []
            },
            {
                name: "Thirumullavaram Beach",
                lat: 8.3167,
                lng: 77.0167,
                type: "serene",
                description: "A pristine beach with golden sand and gentle waves, perfect for a peaceful getaway.",
                features: ["Golden Sand", "Gentle Waves", "Peaceful", "Pristine"],
                rating: 4.3,
                reviews: 756,
                memories: []
            },
            {
                name: "Shanghumukham Beach",
                lat: 8.4667,
                lng: 76.9333,
                type: "popular",
                description: "Located near Trivandrum airport, this beach offers beautiful sunsets and modern amenities.",
                features: ["Sunset Views", "Modern Amenities", "Airport Proximity", "Restaurants"],
                rating: 4.1,
                reviews: 1678,
                memories: []
            },
            {
                name: "Nattika Beach",
                lat: 10.3667,
                lng: 76.0833,
                type: "serene",
                description: "A serene beach with minimal crowds, offering an authentic Kerala coastal experience.",
                features: ["Minimal Crowds", "Authentic Experience", "Fishing", "Tranquil"],
                rating: 4.4,
                reviews: 543,
                memories: []
            },
            {
                name: "Kappil Beach",
                lat: 8.6833,
                lng: 76.7167,
                type: "adventure",
                description: "Where backwaters meet the sea, creating a unique landscape perfect for kayaking and exploration.",
                features: ["Backwater Confluence", "Kayaking", "Unique Landscape", "Exploration"],
                rating: 4.6,
                reviews: 1087,
                memories: []
            }
        ];
    }
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
