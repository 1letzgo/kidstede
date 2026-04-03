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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

function getPOIs() {
    return db.prepare('SELECT * FROM pois ORDER BY created_at DESC').all();
}

function addPOI(name, description, category, lat, lng, image_url) {
    const stmt = db.prepare('INSERT INTO pois (name, description, category, lat, lng, image_url) VALUES (?, ?, ?, ?, ?, ?)');
    return stmt.run(name, description, category, lat, lng, image_url);
}

module.exports = {
    getPOIs,
    addPOI
};
