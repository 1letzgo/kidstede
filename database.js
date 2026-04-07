const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = process.env.DATA_DIR || '/data';
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'database.sqlite');
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

function updatePOI(id, description, ratingCleanliness, ratingEquipment, ratingSize, ratingOverall) {
    return db.prepare(`
        UPDATE pois SET
            description = ?,
            rating_cleanliness = ?,
            rating_equipment = ?,
            rating_size = ?,
            rating_overall = ?
        WHERE id = ?
    `).run(
        description,
        ratingCleanliness || null,
        ratingEquipment || null,
        ratingSize || null,
        ratingOverall || null,
        id
    );
}

function deletePOI(id) {
    return db.prepare('DELETE FROM pois WHERE id = ?').run(id);
}

module.exports = {
    getPOIs,
    addPOI,
    updatePOI,
    deletePOI
};
