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
 * @returns {HTMLElement} The popup content element.
 */
function createPopupContent(beach) {
    const stars = getStarRating(beach.rating);
    // Map features array to feature tags
    const features = beach.features.map(feature =>
        `<span class="feature-tag">${sanitizeHTML(feature)}</span>`
    ).join(''); // Join them into a single string

    // Get weather data (assuming getWeather is globally available from script.js)
    let weather = { temp: '--', icon: 'ph-sun', condition: 'Sunny' };
    if (typeof getWeather === 'function') {
        weather = getWeather(beach.lat, beach.lng);
    }

    // Check itinerary status
    const isInItinerary = typeof itinerary !== 'undefined' && itinerary.includes(beach.name);
    const itineraryBtnText = isInItinerary ? 'Remove from Itinerary' : 'Add to Itinerary';
    const itineraryBtnClass = isInItinerary ? 'action-btn itinerary-btn active' : 'action-btn itinerary-btn';

    // Image HTML
    const imageHtml = beach.imageUrl ?
        `<img src="${beach.imageUrl}" alt="${sanitizeHTML(beach.name || 'Beach image')}" class="popup-hero-image">` : '';

    const container = document.createElement('div');
    container.className = 'beach-popup';
    container.innerHTML = `
            ${imageHtml}
            <div class="popup-header">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h3 style="margin-right: 10px;">${sanitizeHTML(beach.name)}</h3>
                    <div class="weather-widget">
                        <i class="ph ${weather.icon}"></i> ${weather.temp}°C
                    </div>
                </div>
            </div>
            <div class="popup-content">
                <p>${sanitizeHTML(beach.description)}</p>

                <div class="popup-section">
                    <h4>Best Time</h4>
                    <p>${sanitizeHTML(beach.bestTime || 'Year-round')}</p>
                </div>

                <div class="popup-section">
                    <h4>Activities</h4>
                    <ul>
                        ${(beach.activities || []).map(act => `<li>${sanitizeHTML(act)}</li>`).join('')}
                    </ul>
                </div>

                <div class="popup-section">
                    <h4>Accessibility</h4>
                    <p>${sanitizeHTML(beach.accessibility || 'Information not available')}</p>
                </div>

                <div class="beach-features" style="margin-top: 1rem;">
                    ${features}
                </div>

                <div class="beach-rating" aria-label="Rating: ${beach.rating} out of 5 stars">
                    <span class="stars" aria-hidden="true">${stars}</span>
                    <span class="rating-text" aria-hidden="true">${beach.rating}/5 (${beach.reviews} reviews)</span>
                </div>

                <div class="beach-actions" style="grid-template-columns: 1fr; gap: 0.5rem;">
                    <button class="${itineraryBtnClass}" style="width:100%; margin-bottom:0.5rem;">${itineraryBtnText}</button>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                        <button class="action-btn add-memory-btn">Add Memory</button>
                        <button class="action-btn view-memories-btn">View Memories</button>
                    </div>
                </div>
            </div>
    `;

    const itineraryBtn = container.querySelector('.itinerary-btn');
    if (itineraryBtn) {
        itineraryBtn.addEventListener('click', () => {
             toggleItinerary(beach.name);
        });
    }

    return container;
}

/**
 * Shows the photo gallery for a given beach.
 * @param {object} beach - The beach data object.
 */
function showPhotoGallery(beach) {
    const galleryModal = document.getElementById('photo-gallery');
    const galleryPhotos = document.getElementById('gallery-photos');
    const closeGallery = document.querySelector('.close-gallery');

    galleryPhotos.innerHTML = ''; // Clear previous photos

    // Use in-memory data to prevent crashes from corrupted localStorage
    const memories = beach.memories || [];

    if (memories.length === 0) {
        galleryPhotos.innerHTML = '<p>No memories yet. Add one!</p>';
    } else {
        memories.forEach(memory => {
            const figure = document.createElement('figure');
            figure.className = 'gallery-figure';

            const img = document.createElement('img');
            img.src = memory.photo;
            img.alt = memory.note;
            img.className = 'gallery-photo';

            const caption = document.createElement('figcaption');
            caption.className = 'gallery-caption';
            caption.textContent = memory.note;

            figure.appendChild(img);
            figure.appendChild(caption);
            galleryPhotos.appendChild(figure);
        });
    }

    galleryModal.style.display = 'block';
    // Animation frame for smooth transition
    requestAnimationFrame(() => {
        galleryModal.style.opacity = '1';
        galleryModal.querySelector('.photo-gallery-content').style.transform = 'scale(1)';
    });

    const handleOutsideClick = (event) => {
        if (event.target == galleryModal) {
            closeModal();
        }
    };

    // Store the element that triggered the modal to restore focus later
    const previousActiveElement = document.activeElement;

    const closeModal = () => {
        galleryModal.style.opacity = '0';
        galleryModal.querySelector('.photo-gallery-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            galleryModal.style.display = 'none';
            if (previousActiveElement) previousActiveElement.focus();
        }, 300);
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('click', handleOutsideClick);
    };

    const handleKeydown = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }

        if (event.key === 'Tab') {
            const focusableElements = galleryModal.querySelectorAll('a[href], button, textarea, input, select');
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    };

    closeGallery.onclick = closeModal;
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('click', handleOutsideClick);

    // Set initial focus to the close button or first interactive element
    setTimeout(() => {
        const focusable = galleryModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) focusable[0].focus();
    }, 100);
}

/**
 * Shows the modal for adding a new memory.
 * @param {object} beach - The beach data object.
 */
function showMemoryModal(beach) {
    const memoryModal = document.getElementById('memory-modal');
    const closeMemoryModal = document.querySelector('.close-memory-modal');
    let addMemoryForm = document.getElementById('add-memory-form');

    // Clone and replace form to remove previous event listeners cleanly
    const newForm = addMemoryForm.cloneNode(true);
    addMemoryForm.parentNode.replaceChild(newForm, addMemoryForm);
    addMemoryForm = newForm;

    memoryModal.style.display = 'block';
     // Animation frame for smooth transition
     requestAnimationFrame(() => {
        memoryModal.style.opacity = '1';
        memoryModal.querySelector('.memory-modal-content').style.transform = 'scale(1)';
    });

    const handleOutsideClick = (event) => {
        if (event.target == memoryModal) {
            closeModal();
        }
    };

    // Store the element that triggered the modal to restore focus later
    const previousActiveElement = document.activeElement;

    const closeModal = () => {
        memoryModal.style.opacity = '0';
        memoryModal.querySelector('.memory-modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            memoryModal.style.display = 'none';
            if (previousActiveElement) previousActiveElement.focus();
        }, 300);
        window.removeEventListener('keydown', handleKeydown);
        window.removeEventListener('click', handleOutsideClick);
    };

    const handleKeydown = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }

        if (event.key === 'Tab') {
            const focusableElements = memoryModal.querySelectorAll('a[href], button, textarea, input, select');
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        addMemory(beach);
        // Do not close modal here, addMemory does it on success
    };

    addMemoryForm.addEventListener('submit', handleSubmit);

    closeMemoryModal.onclick = closeModal;
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('click', handleOutsideClick);

    // Set initial focus to the first input field
    setTimeout(() => {
        const firstInput = memoryModal.querySelector('input, textarea');
        if (firstInput) firstInput.focus();
    }, 100);
}

function showGeolocationError() {
    const mapContainer = document.getElementById('map');
    const errorNotification = document.createElement('div');
    errorNotification.className = 'geolocation-error';
    errorNotification.textContent = 'Could not determine your location. Showing default map view.';
    mapContainer.appendChild(errorNotification);

    setTimeout(() => {
        errorNotification.remove();
    }, 5000);
}

/**
 * Renders the list of beaches in the sidebar.
 * @param {Array} beaches - The list of beach objects.
 */
function renderBeachList(beaches) {
    const listContainer = document.getElementById('beach-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    beaches.forEach(beach => {
        const item = document.createElement('div');
        item.className = `beach-card ${beach.type}`;
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `View details for ${beach.name}`);
        item.innerHTML = `
            <div class="item-icon"></div>
            <div class="card-content">
                <span class="item-name">${sanitizeHTML(beach.name)}</span>
                <span class="item-type">${sanitizeHTML(beach.type)}</span>
            </div>
        `;

        // Interaction
        const handleClick = () => {
            if (window.innerWidth > 768 && map) {
                const targetLatLng = L.latLng(beach.lat, beach.lng);
                // Check if we are reasonably close (2km) to avoid long flyTo or if already there
                const isClose = map.getCenter().distanceTo(targetLatLng) < 2000;

                const openMarkerPopup = () => {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker && layer.options.title === beach.name) {
                            layer.openPopup();
                        }
                    });
                };

                if (isClose) {
                     // If close, verify if zoom is also decent, if not, flyTo (but short distance)
                     if (map.getZoom() < 12) {
                         map.flyTo(targetLatLng, 14, { animate: true, duration: 1.0 });
                         map.once('moveend', openMarkerPopup);
                     } else {
                         // Already close and zoomed in enough, just pan and open
                         map.panTo(targetLatLng);
                         // Small timeout to ensure pan completes or just open immediately (panTo is animated usually)
                         // Leaflet panTo returns 'this'
                         openMarkerPopup();
                     }
                } else {
                    map.flyTo(targetLatLng, 14, {
                        animate: true,
                        duration: 1.5
                    });

                    // Open popup after fly
                    map.once('moveend', openMarkerPopup);
                }
            }
        };

        item.addEventListener('click', handleClick);

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick();
            }
        });

        item.addEventListener('mouseenter', () => {
             if (!map) return;
             map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.options.title === beach.name) {
                     const icon = layer.getElement();
                     if (icon) {
                         icon.classList.add('hover-highlight');
                         // Add a specialized high-z-index class
                         icon.style.zIndex = 10000;
                     }
                }
            });
        });

        item.addEventListener('mouseleave', () => {
             if (!map) return;
             map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.options.title === beach.name) {
                     const icon = layer.getElement();
                     if (icon) {
                         icon.classList.remove('hover-highlight');
                         icon.style.zIndex = '';
                     }
                }
            });
        });

        listContainer.appendChild(item);
    });
}

