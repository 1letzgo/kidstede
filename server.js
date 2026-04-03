const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPOIs, addPOI } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// API Endpoints
app.get('/api/pois', (req, res) => {
    try {
        const pois = getPOIs();
        res.json(pois);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pois', upload.single('photo'), (req, res) => {
    try {
        const { name, description, category, lat, lng } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        
        if (!name || !lat || !lng) {
            return res.status(400).json({ error: 'Name, Latitude and Longitude are required' });
        }
        
        addPOI(name, description, category, parseFloat(lat), parseFloat(lng), imageUrl);
        res.status(201).json({ message: 'POI added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
