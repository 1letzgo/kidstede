const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

function parseDescriptions() {
    const pois = db.prepare("SELECT id, name, description FROM pois WHERE category = 'Spielplatz'").all();
    console.log(`Found ${pois.length} playgrounds to migrate.`);

    const updateStmt = db.prepare(`
        UPDATE pois 
        SET rating_cleanliness = ?, rating_overall = ?
        WHERE id = ?
    `);

    let count = 0;
    pois.forEach(poi => {
        const desc = poi.description || "";
        let cleanliness = null;
        let overall = null;

        // Extract Cleanliness
        // Examples: "Sauberkeit: Sehr gut", "Sauberkeit: Gut", "Sauberkeit: Befriedigend"
        const cleanMatch = desc.match(/Sauberkeit:\s*(Sehr gut|Gut|Befriedigend|Befriedigend\s*-\s*gut|Gut\s*-\s*befriedigend|Befriedigend\s*-\s*Ausreichend)/i);
        if (cleanMatch) {
            const val = cleanMatch[1].toLowerCase();
            if (val.includes('sehr gut')) cleanliness = 5;
            else if (val.includes('gut')) cleanliness = 4;
            else if (val.includes('befriedigend')) cleanliness = 3;
            else if (val.includes('ausreichend')) cleanliness = 2;
        }

        // Extract Note
        // Examples: "Note: 1", "Note: 2", "Note: 3-4"
        const noteMatch = desc.match(/Note:\s*(\d)(?:-(\d))?/i);
        if (noteMatch) {
            const n1 = parseInt(noteMatch[1]);
            const n2 = noteMatch[2] ? parseInt(noteMatch[2]) : n1;
            const avgNote = (n1 + n2) / 2;

            // Map school grades (1-6) to stars (5-1)
            if (avgNote <= 1.5) overall = 5;
            else if (avgNote <= 2.5) overall = 4;
            else if (avgNote <= 3.5) overall = 3;
            else if (avgNote <= 4.5) overall = 2;
            else overall = 1;
        }

        if (cleanliness !== null || overall !== null) {
            updateStmt.run(cleanliness, overall, poi.id);
            count++;
        }
    });

    console.log(`Successfully migrated ${count} POIs.`);
}

parseDescriptions();
db.close();
