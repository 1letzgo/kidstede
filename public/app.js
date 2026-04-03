// Westerstede Bounds
const WESTERSTEDE_BOUNDS = [
    [53.1818276, 7.7850819], // Southwest
    [53.3364449, 8.0465228]  // Northeast
];
const CENTER = [53.2573, 7.9284];

let map, markers = [];
let currentAddingMarker = null;

// DOM Elements
const addPoiBtn = document.getElementById('add-poi-btn');
const locateBtn = document.getElementById('locate-btn');
const poiPanel = document.getElementById('poi-panel');
const detailPanel = document.getElementById('detail-panel');
const poiForm = document.getElementById('poi-form');
const cancelBtn = document.getElementById('cancel-btn');
const closeDetailBtn = document.getElementById('close-detail-btn');
const categorySelect = document.getElementById('poi-category');
const ratingFieldsContainer = document.getElementById('rating-fields-container');

let userLocationMarker = null;

// Initialize Map
function initMap() {
    map = L.map('map', {
        maxBounds: WESTERSTEDE_BOUNDS,
        maxBoundsViscosity: 1.0,
        minZoom: 12
    }).setView(CENTER, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        className: 'map-tiles'
    }).addTo(map);

    map.on('click', onMapClick);
    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    loadPOIs();
}

function onLocationFound(e) {
    if (userLocationMarker) {
        map.removeLayer(userLocationMarker);
    }

    // Visible pulsing blue dot using inline HTML
    userLocationMarker = L.marker(e.latlng, {
        icon: L.divIcon({
            className: '',
            html: `<div class="user-location-dot"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).addTo(map).bindPopup('📍 Dein aktueller Standort');
    
    map.setView(e.latlng, 16);
}

function onLocationError(e) {
    alert("Standort konnte nicht gefunden werden: " + e.message);
}

locateBtn.addEventListener('click', () => {
    map.locate({setView: true, maxZoom: 16});
});

// Map Click Handler (for adding new POI)
function onMapClick(e) {
    if (!poiPanel.classList.contains('hidden')) {
        const { lat, lng } = e.latlng;
        setFormLocation(lat, lng);
    }
}

function setFormLocation(lat, lng) {
    document.getElementById('poi-lat').value = lat;
    document.getElementById('poi-lng').value = lng;
    
    if (currentAddingMarker) {
        map.removeLayer(currentAddingMarker);
    }
    
    currentAddingMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#4a90e2; width:15px; height:15px; border-radius:50%; border:3px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);'></div>",
            iconSize: [15, 15],
            iconAnchor: [7, 7]
        })
    }).addTo(map);
    
    document.querySelector('.instruction').innerText = "Standort ausgewählt!";
    document.querySelector('.instruction').style.color = "var(--success)";
}

// Category Emojis & Colors
const CATEGORY_EMOJIS = {
    'Spielplatz': '🛝',
    'Park': '🌳',
    'Restaurant': '🍽️',
    'Aktivität': '⚽',
    'Sonstiges': '📍'
};

const CATEGORY_COLORS = {
    'Spielplatz': '#2ecc71',
    'Park': '#27ae60',
    'Restaurant': '#e67e22',
    'Aktivität': '#9b59b6',
    'Sonstiges': '#3498db'
};

function getCategoryColor(category) {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['Sonstiges'];
}

function getCategoryEmoji(category) {
    return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS['Sonstiges'];
}

// Load POIs from API
async function loadPOIs() {
    try {
        const response = await fetch('/api/pois');
        const pois = await response.json();
        
        // Clear existing markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];
        
        pois.forEach(poi => {
            const emoji = getCategoryEmoji(poi.category);
            const marker = L.marker([poi.lat, poi.lng], {
                icon: L.divIcon({
                    className: 'emoji-marker',
                    html: `<div class="emoji-marker-inner">${emoji}</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                })
            }).addTo(map);
            
            marker.on('click', () => showDetails(poi));
            markers.push(marker);
        });
    } catch (err) {
        console.error('Error loading POIs:', err);
    }
}

function renderStars(rating) {
    if (!rating) return '';
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return `<span class="rating-stars">${stars}</span>`;
}

// Show Detail Panel
function showDetails(poi) {
    hidePanels();
    document.getElementById('detail-name').innerText = poi.name;
    document.getElementById('detail-description').innerText = poi.description || 'Keine Beschreibung vorhanden.';
    
    const categoryTag = document.getElementById('detail-category');
    categoryTag.innerText = poi.category || 'Sonstiges';
    categoryTag.style.backgroundColor = getCategoryColor(poi.category) + '22';
    categoryTag.style.color = getCategoryColor(poi.category);
    
    // Render Ratings
    const ratingsContainer = document.getElementById('detail-ratings');
    ratingsContainer.innerHTML = '';
    
    if (poi.category === 'Spielplatz') {
        const ratings = [
            { label: 'Sauberkeit', value: poi.rating_cleanliness },
            { label: 'Geräte', value: poi.rating_equipment },
            { label: 'Größe', value: poi.rating_size },
            { label: 'Gesamt', value: poi.rating_overall }
        ];
        
        ratings.forEach(r => {
            if (r.value) {
                const item = document.createElement('div');
                item.className = 'rating-item';
                item.innerHTML = `
                    <span class="rating-label">${r.label}</span>
                    ${renderStars(r.value)}
                `;
                ratingsContainer.appendChild(item);
            }
        });
    }
    
    const imgContainer = document.getElementById('poi-image-container');
    imgContainer.innerHTML = '';
    if (poi.image_url) {
        const img = document.createElement('img');
        img.src = poi.image_url;
        img.alt = poi.name;
        imgContainer.appendChild(img);
    }
    
    detailPanel.classList.remove('hidden');
}

// Panel Management
function hidePanels() {
    poiPanel.classList.add('hidden');
    detailPanel.classList.add('hidden');
    addPoiBtn.classList.remove('active');
    if (currentAddingMarker) {
        map.removeLayer(currentAddingMarker);
        currentAddingMarker = null;
    }
}

addPoiBtn.addEventListener('click', () => {
    if (poiPanel.classList.contains('hidden')) {
        hidePanels();
        poiPanel.classList.remove('hidden');
        addPoiBtn.classList.add('active');
        document.querySelector('.instruction').innerText = "Klicke auf die Karte, um den Standort zu wählen.";
        document.querySelector('.instruction').style.color = "var(--text-light)";
    } else {
        hidePanels();
    }
});

cancelBtn.addEventListener('click', hidePanels);
closeDetailBtn.addEventListener('click', hidePanels);

// Form Submission
poiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!document.getElementById('poi-lat').value) {
        alert('Bitte wähle zuerst einen Ort auf der Karte aus!');
        return;
    }
    
    const formData = new FormData(poiForm);
    
    try {
        const response = await fetch('/api/pois', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            poiForm.reset();
            hidePanels();
            loadPOIs();
            alert('Ort erfolgreich hinzugefügt!');
        } else {
            const error = await response.json();
            alert('Fehler: ' + error.error);
        }
    } catch (err) {
        alert('Ein Fehler ist aufgetreten.');
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registered:', registration);
        }).catch(error => {
            console.log('SW registration failed:', error);
        });
    });
}

// Form Logic
categorySelect.addEventListener('change', () => {
    if (categorySelect.value === 'Spielplatz') {
        ratingFieldsContainer.classList.remove('hidden');
    } else {
        ratingFieldsContainer.classList.add('hidden');
    }
});

// Star Rating Interaction
document.querySelectorAll('.star-rating .star').forEach(star => {
    star.addEventListener('click', (e) => {
        const ratingContainer = e.target.parentElement;
        const ratingName = ratingContainer.getAttribute('data-rating-name');
        const value = parseInt(e.target.getAttribute('data-value'));
        
        // Update hidden input
        document.getElementById(ratingName).value = value;
        
        // Update star styles
        const stars = ratingContainer.querySelectorAll('.star');
        stars.forEach(s => {
            if (parseInt(s.getAttribute('data-value')) <= value) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    // Set initial state
    if (categorySelect.value === 'Spielplatz') {
        ratingFieldsContainer.classList.remove('hidden');
    }
});
