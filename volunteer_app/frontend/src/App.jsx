import React, { useEffect, useState } from 'react';
import MapComponent from './components/Map';
import Sidebar from './components/Sidebar';
import { getVolunteers, getIncidents } from './services/api';

function App() {
    const [volunteers, setVolunteers] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch (Mocking "Real-Time" for now by just fetching once)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real scenario with backend running:
                // const vols = await getVolunteers();
                // const incs = await getIncidents();

                // MOCK DATA for display purposes if backend is down
                const mockVols = Array.from({ length: 15 }).map((_, i) => ({
                    id: i,
                    name: `Volunteer ${i + 1}`,
                    status: Math.random() > 0.5 ? 'ONLINE' : 'BUSY',
                    skills: ['Medical', 'SAR'],
                    location: {
                        type: 'Point',
                        coordinates: [-74.0060 + (Math.random() - 0.5) * 0.1, 40.7128 + (Math.random() - 0.5) * 0.1]
                    }
                }));

                const mockIncs = [
                    {
                        id: 101,
                        title: 'Structural Fire',
                        description: 'Reported smoke in downtown area.',
                        status: 'OPEN',
                        location: {
                            type: 'Point',
                            coordinates: [-74.01, 40.715]
                        }
                    },
                    {
                        id: 102,
                        title: 'Medical Emergency',
                        description: 'Cardiac arrest reported.',
                        status: 'DISPATCHED',
                        location: {
                            type: 'Point',
                            coordinates: [-73.99, 40.710]
                        }
                    }
                ];

                // Try fetch, fallback to mock
                try {
                    const vols = await getVolunteers();
                    const incs = await getIncidents();
                    setVolunteers(vols);
                    setIncidents(incs);
                } catch (e) {
                    console.warn("Backend not reachable, using mock data");
                    setVolunteers(mockVols);
                    setIncidents(mockIncs);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex h-screen w-screen bg-slate-950">
            <Sidebar incidents={incidents} volunteers={volunteers} />
            <div className="flex-1 relative">
                <MapComponent volunteers={volunteers} incidents={incidents} />

                {/* Loading Overlay */}
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/50 z-[1000] flex items-center justify-center">
                        <div className="text-cyan-400 font-bold animate-pulse">Initializing Command Center...</div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
