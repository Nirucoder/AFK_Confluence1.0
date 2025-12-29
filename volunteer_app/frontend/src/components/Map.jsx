import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not showing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ volunteers, incidents }) => {
    // Center map on a default location (e.g. City center)
    // If we had a specific city from the prompt, we'd use it. For now, 0,0 or a dummy loc.
    // Prompt mentioned "10km radius of a specific city". Let's use New York (40.7128, -74.0060) as a demo.
    const position = [40.7128, -74.0060];

    return (
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="w-full h-full z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {volunteers.map((vol) => {
                // PostGIS GeoJSON is usually { type: 'Point', coordinates: [lon, lat] }
                // Leaflet needs [lat, lon]
                const { coordinates } = vol.location; // GeoJSON is [lon, lat]
                const latLng = [coordinates[1], coordinates[0]];

                return (
                    <Marker key={vol.id} position={latLng}>
                        <Popup>
                            <div className="text-slate-900">
                                <strong>{vol.name}</strong><br />
                                Status: {vol.status}<br />
                                Skills: {vol.skills && vol.skills.join(', ')}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {incidents.map((inc) => {
                const { coordinates } = inc.location;
                const latLng = [coordinates[1], coordinates[0]];
                // Different icon for incidents could be added here
                return (
                    <Marker key={`inc-${inc.id}`} position={latLng}>
                        <Popup>
                            <div className="text-slate-900">
                                <strong>Incident: {inc.title}</strong><br />
                                {inc.description}
                            </div>
                        </Popup>
                    </Marker>
                )
            })}

        </MapContainer>
    );
};

export default MapComponent;
