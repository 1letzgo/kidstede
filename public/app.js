// Westerstede Bounds
const WESTERSTEDE_BOUNDS = [
    [53.1818276, 7.7850819], // Southwest
    [53.3364449, 8.0465228]  // Northeast
];
const CENTER = [53.2573, 7.9284];

let map, markers = [];
let allPois = [];
let currentAddingMarker = null;
let currentPoiId = null;
let currentPoi = null;
let isAdmin = false;

// DOM Elements
const addPoiBtn = document.getElementById('add-poi-btn');
const logoutBtn = document.getElementById('logout-btn');
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
        allPois = pois;

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

// List Panel
const CATEGORY_ORDER = ['Spielplatz', 'Park', 'Restaurant', 'Aktivität', 'Sonstiges'];
const listPanel = document.getElementById('list-panel');
const listBtn = document.getElementById('list-btn');

function renderListPanel() {
    const container = document.getElementById('list-content');
    container.innerHTML = '';

    if (allPois.length === 0) {
        container.innerHTML = '<p class="list-empty">Noch keine Orte eingetragen.</p>';
        return;
    }

    const grouped = {};
    allPois.forEach(poi => {
        const cat = poi.category || 'Sonstiges';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(poi);
    });

    const categories = CATEGORY_ORDER.filter(c => grouped[c]).concat(
        Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c))
    );

    categories.forEach(cat => {
        const header = document.createElement('div');
        header.className = 'list-category-header';
        header.innerHTML = `<span>${getCategoryEmoji(cat)}</span><span>${cat}</span>`;
        container.appendChild(header);

        grouped[cat].forEach(poi => {
            const item = document.createElement('div');
            item.className = 'list-poi-item';
            const stars = poi.rating_overall ? '★'.repeat(poi.rating_overall) : '';
            item.innerHTML = `
                <span>${getCategoryEmoji(poi.category)}</span>
                <span class="list-poi-name">${poi.name}</span>
                ${stars ? `<span class="list-poi-stars">${stars}</span>` : ''}
            `;
            item.addEventListener('click', () => {
                hidePanels();
                map.setView([poi.lat, poi.lng], 16);
                showDetails(poi);
            });
            container.appendChild(item);
        });
    });
}

listBtn.addEventListener('click', () => {
    if (listPanel.classList.contains('hidden')) {
        hidePanels();
        renderListPanel();
        listPanel.classList.remove('hidden');
    } else {
        hidePanels();
    }
});

function renderStars(rating) {
    if (!rating) return '';
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '★' : '☆';
    }
    return `<span class="rating-stars">${stars}</span>`;
}

function renderDetailRatings(poi) {
    const ratingsContainer = document.getElementById('detail-ratings');
    ratingsContainer.innerHTML = '';
    if (poi.category === 'Spielplatz') {
        [
            { label: 'Sauberkeit', value: poi.rating_cleanliness },
            { label: 'Geräte', value: poi.rating_equipment },
            { label: 'Größe', value: poi.rating_size },
            { label: 'Gesamt', value: poi.rating_overall }
        ].forEach(r => {
            if (r.value) {
                const item = document.createElement('div');
                item.className = 'rating-item';
                item.innerHTML = `<span class="rating-label">${r.label}</span>${renderStars(r.value)}`;
                ratingsContainer.appendChild(item);
            }
        });
    }
}

// Show Detail Panel
function showDetails(poi) {
    hidePanels();
    currentPoiId = poi.id;
    currentPoi = poi;
    document.getElementById('detail-name').innerText = poi.name;
    document.getElementById('detail-description').innerText = poi.description || 'Keine Beschreibung vorhanden.';

    const categoryTag = document.getElementById('detail-category');
    categoryTag.innerText = poi.category || 'Sonstiges';
    categoryTag.style.backgroundColor = getCategoryColor(poi.category) + '22';
    categoryTag.style.color = getCategoryColor(poi.category);

    renderDetailRatings(poi);
    
    const imgContainer = document.getElementById('poi-image-container');
    imgContainer.innerHTML = '';
    if (poi.image_url) {
        const img = document.createElement('img');
        img.src = poi.image_url;
        img.alt = poi.name;
        imgContainer.appendChild(img);
    }
    
    // Reset edit mode
    setEditMode(false);

    detailPanel.classList.remove('hidden');
}

function setEditMode(on) {
    document.getElementById('detail-description').style.display = on ? 'none' : '';
    document.getElementById('detail-description-edit').style.display = on ? 'block' : 'none';
    document.getElementById('detail-ratings').style.display = on ? 'none' : '';
    document.getElementById('detail-ratings-edit').style.display = (on && currentPoi && currentPoi.category === 'Spielplatz') ? 'block' : 'none';
    document.getElementById('edit-poi-btn').style.display = (!on && isAdmin) ? '' : 'none';
    document.getElementById('save-poi-btn').style.display = (on && isAdmin) ? '' : 'none';
    document.getElementById('delete-poi-btn').style.display = (!on && isAdmin) ? '' : 'none';
}

// Edit stars interaction
document.querySelectorAll('.edit-stars .star').forEach(star => {
    star.addEventListener('click', e => {
        const container = e.target.closest('.star-rating');
        const val = parseInt(e.target.dataset.value);
        container.dataset.selected = val;
        container.querySelectorAll('.star').forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.value) <= val);
        });
    });
});

function initEditRatings(poi) {
    document.querySelectorAll('.edit-stars').forEach(container => {
        const key = container.dataset.key;
        const val = poi[key] || 0;
        container.dataset.selected = val;
        container.querySelectorAll('.star').forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.value) <= val);
        });
    });
}

// Edit / Delete
document.getElementById('edit-poi-btn').addEventListener('click', () => {
    const descEl = document.getElementById('detail-description');
    document.getElementById('detail-description-edit').value =
        descEl.innerText === 'Keine Beschreibung vorhanden.' ? '' : descEl.innerText;
    initEditRatings(currentPoi);
    setEditMode(true);
});

document.getElementById('save-poi-btn').addEventListener('click', async () => {
    const description = document.getElementById('detail-description-edit').value;
    const body = { description };
    document.querySelectorAll('.edit-stars').forEach(container => {
        const val = parseInt(container.dataset.selected) || null;
        if (val) body[container.dataset.key] = val;
    });

    const res = await fetch(`/api/pois/${currentPoiId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (res.ok) {
        // Update local poi object and re-render
        currentPoi.description = description;
        document.querySelectorAll('.edit-stars').forEach(c => {
            currentPoi[c.dataset.key] = parseInt(c.dataset.selected) || null;
        });
        document.getElementById('detail-description').innerText = description || 'Keine Beschreibung vorhanden.';
        renderDetailRatings(currentPoi);
        setEditMode(false);
        loadPOIs();
    } else if (res.status === 401) {
        window.location.href = '/admin';
    }
});

document.getElementById('delete-poi-btn').addEventListener('click', async () => {
    if (!confirm('Diesen Ort wirklich löschen?')) return;
    const res = await fetch(`/api/pois/${currentPoiId}`, { method: 'DELETE' });
    if (res.ok) {
        hidePanels();
        loadPOIs();
    } else if (res.status === 401) {
        window.location.href = '/admin';
    }
});

// Panel Management
function hidePanels() {
    poiPanel.classList.add('hidden');
    detailPanel.classList.add('hidden');
    if (typeof listPanel !== 'undefined') listPanel.classList.add('hidden');
    addPoiBtn.classList.remove('active');
    if (currentAddingMarker) {
        map.removeLayer(currentAddingMarker);
        currentAddingMarker = null;
    }
}

addPoiBtn.addEventListener('click', () => {
    if (poiPanel.classList.contains('hidden')) {
        hidePanels();
        poiForm.reset();
        ratingFieldsContainer.style.display = categorySelect.value === 'Spielplatz' ? '' : 'none';
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
        } else if (response.status === 401) {
            window.location.href = '/admin';
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
    ratingFieldsContainer.style.display = categorySelect.value === 'Spielplatz' ? '' : 'none';
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

// Auth
async function checkAuth() {
    const res = await fetch('/api/auth-status');
    const { authenticated } = await res.json();
    isAdmin = authenticated;
    addPoiBtn.style.display = authenticated ? 'flex' : 'none';
    logoutBtn.style.display = authenticated ? 'flex' : 'none';
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = authenticated ? '' : 'none';
    });
}

logoutBtn.addEventListener('click', async () => {
    await fetch('/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    checkAuth();
    // Set initial state
    ratingFieldsContainer.style.display = categorySelect.value === 'Spielplatz' ? '' : 'none';
});
