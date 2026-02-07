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
 * @returns {string} HTML string for the popup content.
 */
function createPopupContent(beach) {
    const stars = getStarRating(beach.rating);
    // Map features array to feature tags
    const features = beach.features.map(feature =>
        `<span class="feature-tag">${sanitizeHTML(feature)}</span>`
    ).join(''); // Join them into a single string

    return `
        <div class="beach-popup">
            <div class="popup-header">
                <h3>${sanitizeHTML(beach.name)}</h3>
            </div>
            <div class="popup-content">
                <p>${sanitizeHTML(beach.description)}</p>
                <div class="beach-features">
                    ${features}
                </div>
                <div class="beach-rating" aria-label="Rating: ${beach.rating} out of 5 stars">
                    <span class="stars" aria-hidden="true">${stars}</span>
                    <span class="rating-text" aria-hidden="true">${beach.rating}/5 (${beach.reviews} reviews)</span>
                    <span class="sr-only">Rated ${beach.rating} out of 5 stars based on ${beach.reviews} reviews</span>
                </div>
                <div class="beach-actions">
                    <button class="action-btn add-memory-btn">Add Memory</button>
                    <button class="action-btn view-memories-btn">View Memories</button>
                </div>
            </div>
        </div>
    `;
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

    const storedMemories = localStorage.getItem(beach.name);
    const memories = storedMemories ? JSON.parse(storedMemories) : [];

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

    const closeModal = () => {
        galleryModal.style.opacity = '0';
        galleryModal.querySelector('.photo-gallery-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            galleryModal.style.display = 'none';
        }, 300);
        window.removeEventListener('keydown', handleEsc);
    };

    const handleEsc = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    closeGallery.onclick = closeModal;
    window.addEventListener('keydown', handleEsc);

    window.onclick = (event) => {
        if (event.target == galleryModal) {
            closeModal();
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
     // Animation frame for smooth transition
     requestAnimationFrame(() => {
        memoryModal.style.opacity = '1';
        memoryModal.querySelector('.memory-modal-content').style.transform = 'scale(1)';
    });

    const closeModal = () => {
        memoryModal.style.opacity = '0';
        memoryModal.querySelector('.memory-modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            memoryModal.style.display = 'none';
        }, 300);
        window.removeEventListener('keydown', handleEsc);
    };

    const handleEsc = (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        addMemory(beach);
        // Do not close modal here, addMemory does it on success
    };

    addMemoryForm.onsubmit = handleSubmit;
    closeMemoryModal.onclick = closeModal;
    window.addEventListener('keydown', handleEsc);

    window.onclick = (event) => {
        if (event.target == memoryModal) {
            closeModal();
        }
    };
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
                // Check if we are already close enough to avoid flyTo race condition
                const isClose = map.getCenter().distanceTo(targetLatLng) < 100 && map.getZoom() === 14;

                if (isClose) {
                    map.eachLayer((layer) => {
                        if (layer instanceof L.Marker && layer.options.title === beach.name) {
                            layer.openPopup();
                        }
                    });
                } else {
                    map.flyTo(targetLatLng, 14, {
                        animate: true,
                        duration: 1.5
                    });

                    // Open popup after fly
                    map.once('moveend', () => {
                        map.eachLayer((layer) => {
                            if (layer instanceof L.Marker && layer.options.title === beach.name) {
                                layer.openPopup();
                            }
                        });
                    });
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

document.querySelectorAll('.legend-item').forEach(button => {
    button.addEventListener('click', () => {
        const type = button.dataset.filter;
        filterMarkers(type);

        document.querySelectorAll('.legend-item').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});
