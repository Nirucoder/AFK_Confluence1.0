# Volunteer Response System

A comprehensive Emergency Response Coordination platform featuring a central Command Center and a mobile-first Volunteer Responder App.

## 📂 Project Structure

- **`/frontend`**: React-based Command Center Dashboard (Vite + Tailwind + Leaflet).
- **`/backend`**: Node.js & Express API with Socket.io for real-time connection.
- **`/database`**: PostGIS setup files for geospatial data management.
- **`demo.html`**: A standalone, zero-setup HTML demo of the Volunteer App logic (Navigation, Real-time updates simulation).
- **`docker-compose.yml`**: Full orchestration to run the DB and Backend locally.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)

### 1. Run the Backend & Database
```bash
docker-compose up -d --build
```
This starts:
- **Postgres/PostGIS** on `localhost:5432`
- **API Server** on `localhost:3000`

### 2. Run the Command Center (Frontend)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the Command Center.

### 3. Run the Volunteer Demo
Simply open `demo.html` in your browser to simulate the volunteer experience without needing the full backend stack running.

## 🛠 Tech Stack
- **Frontend**: React, TailwindCSS, Lucide Icons, Leaflet Maps
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL + PostGIS Extension
- **Devops**: Docker Compose

## License
MIT
