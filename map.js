let map;
let beachMarkers = [];

function initializeMap(beachesData) {
    beaches = beachesData;
    // Initialize the map centered on Kerala with a specific zoom level
    map = L.map('map', {
        center: [10.8505, 76.2711], // Default center (Kerala)
        zoom: 7,                    // Default zoom
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
                map.flyTo([latitude, longitude], 9, {
                    animate: true,
                    duration: 2
                });
            },
            () => {
                showGeolocationError();
            }
        );
    } else {
        showGeolocationError();
    }

    // Add custom zoom control to the top right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Handle map clicks to close bottom sheet on mobile
    map.on('click', function() {
        if (window.innerWidth <= 768) {
            const infoPanel = document.getElementById('infoPanel');
            const bottomSheetContent = document.getElementById('bottom-sheet-content');

            if (infoPanel.classList.contains('expanded')) {
                infoPanel.classList.remove('expanded');
                infoPanel.classList.remove('has-selection');
                // Optional: Clear content after animation
                setTimeout(() => {
                   if (!infoPanel.classList.contains('expanded')) {
                       bottomSheetContent.innerHTML = '';
                   }
                }, 400);
            }
        }
    });

    // Add CartoDB Voyager tile layer for a more polished look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        opacity: 0.9,
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
        // Using Phosphor icons instead of emoji
        let iconClass = 'ph-beach-ball'; // default
        if (type === 'popular') iconClass = 'ph-users-three';
        if (type === 'serene') iconClass = 'ph-sun-horizon';
        if (type === 'adventure') iconClass = 'ph-person-simple-swim';

        return L.divIcon({
            className: 'custom-marker', // Class for CSS styling and animations
            html: `
                <div class="pin-wrapper">
                    <div class="pin-pulse" style="background: ${color}"></div>
                    <div class="pin" style="
                        background: linear-gradient(135deg, ${color}, ${color}); /* Fallback */
                        background: linear-gradient(135deg, ${color} 0%, rgba(0,0,0,0.2) 100%);
                        background-blend-mode: multiply;
                        background-color: ${color};
                        width: 32px;
                        height: 32px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        box-shadow: 0 4px 15px rgba(0,0,0,0.25);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        border: 2px solid white;
                    ">
                        <i class="ph ${iconClass}" style="
                            transform: rotate(45deg);
                            font-size: 16px;
                            color: white;
                        "></i>
                    </div>
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36], // Point of the icon which will correspond to marker's location
            popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
        });
    }

    // Function to handle opening details
    function openBeachDetails(beach) {
        if (window.innerWidth <= 768) {
            // Mobile: Use Bottom Sheet
            const bottomSheetContent = document.getElementById('bottom-sheet-content');
            const infoPanel = document.getElementById('infoPanel');

            // Populate content
            bottomSheetContent.innerHTML = createPopupContent(beach);

            // Expand sheet
            infoPanel.classList.add('expanded');
            infoPanel.classList.add('has-selection');

            // Attach event listeners to the new buttons in the bottom sheet
            setTimeout(() => {
                const addMemoryBtn = bottomSheetContent.querySelector('.add-memory-btn');
                const viewMemoriesBtn = bottomSheetContent.querySelector('.view-memories-btn');
                if (addMemoryBtn) addMemoryBtn.onclick = () => showMemoryModal(beach);
                if (viewMemoriesBtn) viewMemoriesBtn.onclick = () => showPhotoGallery(beach);
            }, 100);

        } else {
            // Desktop: Use default Popup (already bound, just open)
            // Logic handled by Leaflet's bindPopup
        }
    }

    // Iterate over each beach and add a marker to the map
    beaches.forEach((beach, index) => {
        const marker = L.marker([beach.lat, beach.lng], {
            icon: createCustomIcon(beach.type), // Use custom icon based on beach type
            title: beach.name, // Title for accessibility and hover
            alt: `Marker for ${beach.name} beach` // Alt text for accessibility
        });

        // Store beach data directly on the marker object for easy access
        marker.beachData = beach;
        beachMarkers.push(marker);
        marker.addTo(map);

        // Bind popup for desktop
        const popup = L.popup({
            maxWidth: 320,
            minWidth: 300,
            closeButton: false, // Cleaner look
            className: 'custom-popup'
        }).setContent(createPopupContent(beach));

        marker.bindPopup(popup);

        // Add mouseover event to open popup on hover (Desktop only)
        marker.on('mouseover', function(e) {
             if (window.innerWidth > 768) {
                this.openPopup();
             }
        });

        // Add click event
        marker.on('click', function(e) {
            console.log(`Beach clicked: ${beach.name}`);

            if (window.innerWidth <= 768) {
                // Mobile: Prevent default popup and show bottom sheet
                this.closePopup(); // Ensure popup doesn't show
                openBeachDetails(beach);
            }
        });

        marker.on('popupopen', function() {
            // This event fires on desktop hover/click
            const addMemoryBtn = this.getPopup().getElement().querySelector('.add-memory-btn');
            const viewMemoriesBtn = this.getPopup().getElement().querySelector('.view-memories-btn');

            if (addMemoryBtn) {
                addMemoryBtn.onclick = () => showMemoryModal(beach);
            }

            if (viewMemoriesBtn) {
                viewMemoriesBtn.onclick = () => showPhotoGallery(beach);
            }
        });

        // We will handle animation after the map is ready to avoid race conditions.
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
            const markerElements = document.querySelectorAll('.custom-marker');
            markerElements.forEach((markerEl, index) => {
                // Staggered entrance
                markerEl.style.opacity = '0';
                markerEl.style.animation = 'popupSlideIn 0.6s forwards cubic-bezier(0.34, 1.56, 0.64, 1)';
                markerEl.style.animationDelay = `${index * 100}ms`;
            });
        }, 500); // Delay before starting marker entrance animations
    });

    /**
     * Handles window resize events to invalidate map size.
     */
    function handleResize() {
        map.invalidateSize(); // Recalculate map size when container changes
    }

    // Attach resize event listener
    window.addEventListener('resize', handleResize);
    // handleResize(); // Not needed on load for simple invalidation

    // Add a single keyboard event listener for map navigation
    document.addEventListener('keydown', function(e) {
        if (map && map.isFocused()) {
            switch(e.key) {
                case 'ArrowUp':
                    map.panBy([0, -50]);
                    break;
                case 'ArrowDown':
                    map.panBy([0, 50]);
                    break;
                case 'ArrowLeft':
                    map.panBy([-50, 0]);
                    break;
                case 'ArrowRight':
                    map.panBy([50, 0]);
                    break;
                case '+':
                case '=':
                    map.zoomIn();
                    break;
                case '-':
                    map.zoomOut();
                    break;
            }
        }
    });
}

/**
 * Filters map markers and sidebar list items by beach type.
 * @param {string} type - The type of beach to filter by (all, popular, serene, adventure).
 */
function filterMarkers(type) {
    // Filter Map Markers
    beachMarkers.forEach(marker => {
        if (type === 'all' || marker.beachData.type === type) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });

    // Filter Sidebar List Items
    const listItems = document.querySelectorAll('.beach-card');
    listItems.forEach(item => {
        if (type === 'all' || item.classList.contains(type)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}
