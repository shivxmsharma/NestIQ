'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Captures clicks on the map and updates the latitude/longitude
function MapClickHandler({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

export default function LocationPicker({ location, setLocation, scrollWheelZoom = true }) {
  return (
    <div className="h-75 w-full rounded-xl overflow-hidden border border-gray-200 relative z-10" style={{ height: '300px' }}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={scrollWheelZoom}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.lat, location.lng]} />
        <MapClickHandler setLocation={setLocation} />
      </MapContainer>
    </div>
  );
}