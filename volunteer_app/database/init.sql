-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Enum for Skills (example based on prompt)
CREATE TYPE volunteer_skill AS ENUM ('Medical', 'SAR', 'Logistics');

-- Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOMETRY(Point, 4326) NOT NULL, -- WGS 84
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_agency_id VARCHAR(255) NOT NULL
);

-- Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'OFFLINE', -- ONLINE, BUSY, OFFLINE
    skills volunteer_skill[] NOT NULL,
    location GEOMETRY(Point, 4326),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_agency_id VARCHAR(255) NOT NULL
);

-- Geofences Table
CREATE TABLE IF NOT EXISTS geofences (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_agency_id VARCHAR(255) NOT NULL
);

-- Create spatial indexes for performance
CREATE INDEX idx_incidents_location ON incidents USING GIST (location);
CREATE INDEX idx_volunteers_location ON volunteers USING GIST (location);
CREATE INDEX idx_geofences_boundary ON geofences USING GIST (boundary);
