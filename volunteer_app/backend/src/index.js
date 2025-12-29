const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// --- Incidents Routes ---

// Get all incidents
app.get('/incidents', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT id, title, description, status, created_by_agency_id,
      ST_AsGeoJSON(location)::json as location 
      FROM incidents
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create incident
app.post('/incidents', async (req, res) => {
    const { title, description, latitude, longitude, agency_id } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO incidents (title, description, location, created_by_agency_id)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5)
       RETURNING id, title, ST_AsGeoJSON(location)::json as location`,
            [title, description, latitude, longitude, agency_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Find 5 closest volunteers to an incident
app.get('/incidents/:id/closest-volunteers', async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Get incident location
        const incidentRes = await db.query('SELECT location FROM incidents WHERE id = $1', [id]);
        if (incidentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        // const incidentLoc = incidentRes.rows[0].location; // Use directly in next query if needed or join

        // 2. Spatial Query using ST_Distance and ST_DWithin (optional filter)
        // We order by distance using the <-> operator (nearest neighbor) which is very fast with GiST indexes
        const query = `
        SELECT 
            v.id, 
            v.name, 
            v.skills,
            v.status,
            ST_Distance(v.location, i.location) as distance_meters,
            ST_AsGeoJSON(v.location)::json as location
        FROM volunteers v, incidents i
        WHERE i.id = $1
        AND v.status != 'OFFLINE'
        ORDER BY v.location <-> i.location
        LIMIT 5
    `;

        const result = await db.query(query, [id]);
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Volunteers Routes ---

// Get all volunteers
app.get('/volunteers', async (req, res) => {
    try {
        const result = await db.query(`
      SELECT id, name, status, skills, created_by_agency_id,
      ST_AsGeoJSON(location)::json as location 
      FROM volunteers
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create volunteer (or update location)
app.post('/volunteers', async (req, res) => {
    const { name, skills, latitude, longitude, agency_id, status } = req.body;
    try {
        // Basic insert for now
        const result = await db.query(
            `INSERT INTO volunteers (name, skills, location, created_by_agency_id, status)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5, $6)
       RETURNING id, name, status, ST_AsGeoJSON(location)::json as location`,
            [name, skills, latitude, longitude, agency_id, status || 'OFFLINE']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Basic Socket connection (Placeholder for Phase 3)
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
