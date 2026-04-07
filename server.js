const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPOIs, addPOI, updatePOI, deletePOI } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ammerino_admin';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'ammerino-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 } // 8 Stunden
}));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) return next();
    res.status(401).json({ error: 'Nicht angemeldet' });
}

// Admin Login
app.get('/admin', (req, res) => {
    if (req.session && req.session.authenticated) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/admin/login', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        return res.redirect('/');
    }
    res.redirect('/admin?error=1');
});

app.post('/admin/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/admin'));
});

// API Endpoints
app.get('/api/auth-status', (req, res) => {
    res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

app.get('/api/pois', (req, res) => {
    try {
        const pois = getPOIs();
        res.json(pois);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pois', requireAuth, upload.single('photo'), (req, res) => {
    try {
        const { name, description, category, lat, lng, rating_cleanliness, rating_equipment, rating_size, rating_overall } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !lat || !lng) {
            return res.status(400).json({ error: 'Name, Latitude and Longitude are required' });
        }

        addPOI(
            name,
            description,
            category,
            parseFloat(lat),
            parseFloat(lng),
            imageUrl,
            rating_cleanliness ? parseInt(rating_cleanliness) : null,
            rating_equipment ? parseInt(rating_equipment) : null,
            rating_size ? parseInt(rating_size) : null,
            rating_overall ? parseInt(rating_overall) : null
        );
        res.status(201).json({ message: 'POI added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/pois/:id', requireAuth, (req, res) => {
    try {
        const result = updatePOI(req.params.id, req.body.description ?? '');
        if (result.changes === 0) return res.status(404).json({ error: 'POI nicht gefunden' });
        res.json({ message: 'Aktualisiert' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/pois/:id', requireAuth, (req, res) => {
    try {
        const result = deletePOI(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'POI nicht gefunden' });
        res.json({ message: 'Gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
