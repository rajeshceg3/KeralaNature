let map;

function initializeMap(beachesData) {
    beaches = beachesData;
    // Initialize the map centered on Kerala with a specific zoom level
    map = L.map('map', {
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
                showGeolocationError();
            }
        );
    } else {
        map.setView([10.8505, 76.2711], 7); // Default to Kerala
        showGeolocationError();
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

    // Iterate over each beach and add a marker to the map
    beaches.forEach((beach, index) => {
        const marker = L.marker([beach.lat, beach.lng], {
            icon: createCustomIcon(beach.type), // Use custom icon based on beach type
            title: beach.name, // Title for accessibility and hover
            alt: `Marker for ${beach.name} beach` // Alt text for accessibility
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
}
