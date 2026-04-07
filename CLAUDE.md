# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Kidstede** is a Progressive Web App (PWA) for discovering kid-friendly locations in Westerstede, Germany, built for the SPD Westerstede organization. It is a full-stack Node.js app with no build step — vanilla JS frontend served statically, Express backend, and SQLite database.

## Commands

```bash
# Start the server (runs on port 3000)
npm start

# Run database migration (converts legacy rating data in descriptions to structured columns)
node migrate_ratings.js
```

There is no build step, no transpilation, and no test suite.

## Architecture

### Stack
- **Backend**: Express.js v5, better-sqlite3 (synchronous SQLite), Multer (file uploads)
- **Frontend**: Vanilla JS (ES6+), HTML5, CSS3 with custom properties, Leaflet.js v1.9.4 (maps via CDN)
- **Database**: SQLite (`database.sqlite` at project root)
- **PWA**: Service Worker (`public/sw.js`) with cache-first strategy, Web App Manifest

### Key Files
| File | Purpose |
|------|---------|
| `server.js` | Express app: serves static files, REST API endpoints, Multer upload config |
| `database.js` | SQLite schema setup and all query functions |
| `public/app.js` | All frontend logic: Leaflet map, POI rendering, form handling, geolocation |
| `public/index.html` | Single-page HTML shell (German language) |
| `public/sw.js` | Service Worker — update cache name (`kidstede-vN`) when deploying changes |

### API
- `GET /api/pois` — Returns all POIs ordered by creation date
- `POST /api/pois` — Creates a POI; accepts `multipart/form-data` (image optional, stored in `uploads/`)

### Database Schema (`pois` table)
```sql
id, name, description, category, lat, lng, image_url,
rating_cleanliness, rating_equipment, rating_size, rating_overall (1-5),
created_at
```

### Map Bounds
The Leaflet map is constrained to Westerstede region: `53.18–53.33°N`, `7.78–8.04°E`.

### Categories
`Spielplatz` (playground), `Park`, `Restaurant/Café`, `Aktivität`, `Sonstiges`

### Deployment
Docker (Node.js 20-slim). Build tools (`python3`, `make`, `g++`) are installed in the image to compile `better-sqlite3` native bindings. Port 3000 is exposed.

The Service Worker (`public/sw.js`) does **not** cache assets — all requests go directly to the network so updates reach users immediately.
