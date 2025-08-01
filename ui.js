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
            const img = document.createElement('img');
            img.src = memory.photo;
            img.alt = memory.note;
            img.className = 'gallery-photo';
            galleryPhotos.appendChild(img);
        });
    }

    galleryModal.style.display = 'block';

    const closeModal = () => {
        galleryModal.style.display = 'none';
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

    const closeModal = () => {
        memoryModal.style.display = 'none';
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
