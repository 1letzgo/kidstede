const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS pois (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    image_url TEXT,
    rating_cleanliness INTEGER,
    rating_equipment INTEGER,
    rating_size INTEGER,
    rating_overall INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function getPOIs() {
    return db.prepare('SELECT * FROM pois ORDER BY created_at DESC').all();
}

function addPOI(name, description, category, lat, lng, image_url, ratingCleanliness, ratingEquipment, ratingSize, ratingOverall) {
    const stmt = db.prepare(`
        INSERT INTO pois (name, description, category, lat, lng, image_url, rating_cleanliness, rating_equipment, rating_size, rating_overall) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(name, description, category, lat, lng, image_url, ratingCleanliness || null, ratingEquipment || null, ratingSize || null, ratingOverall || null);
}

module.exports = {
    getPOIs,
    addPOI
};
