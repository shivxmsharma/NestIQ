'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, BedDouble, Maximize2, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's broken default icon paths in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Chandigarh center
const DEFAULT_CENTER = [30.7333, 76.7794];
const DEFAULT_ZOOM = 12;

const formatPrice = (price, listingType) => {
  if (!price) return 'Price on request';
  if (listingType === 'rent' || listingType === 'pg')
    return `₹${price.toLocaleString('en-IN')}/mo`;
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

// Custom price pill marker
const createPriceIcon = (price, listingType, isActive = false) => {
  const bgColor = isActive ? '#2563eb' : '#ffffff';
  const textColor = isActive ? '#ffffff' : '#111827';
  const borderColor = isActive ? '#2563eb' : '#d1d5db';

  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `
      <div style="
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translate(-50%, -10px);
        background-color: ${bgColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease;
        z-index: ${isActive ? 999 : 1};
      ">
        ${formatPrice(price, listingType)}
        <div style="
          position: absolute;
          left: 50%;
          bottom: -6px;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${bgColor};
        "></div>
        ${!isActive ? `
        <div style="
          position: absolute;
          left: 50%;
          bottom: -7px;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid ${borderColor};
          z-index: -1;
        "></div>` : ''}
      </div>
    `,
    iconAnchor: [0, 0],
  });
};

export default function PropertyMap({ hits }) {
  const [activeId, setActiveId] = useState(null);

  const propertiesWithCoords = hits.filter(
    (h) => h._geoloc?.lat && h._geoloc?.lng
  );

  // Compute center from hits, or fall back to Chandigarh
  const center =
    propertiesWithCoords.length > 0
      ? [propertiesWithCoords[0]._geoloc.lat, propertiesWithCoords[0]._geoloc.lng]
      : DEFAULT_CENTER;

  const activeHit = activeId ? propertiesWithCoords.find(h => h.objectID === activeId) : null;

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-gray-200 z-10">
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          background: transparent;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 240px !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />

        {propertiesWithCoords.map((hit) => (
          <Marker
            key={hit.objectID}
            position={[hit._geoloc.lat, hit._geoloc.lng]}
            icon={createPriceIcon(hit.price, hit.listingType, activeId === hit.objectID)}
            eventHandlers={{
              click: () => setActiveId(hit.objectID)
            }}
          />
        ))}

        {activeHit && (
          <Popup
            position={[activeHit._geoloc.lat, activeHit._geoloc.lng]}
            offset={[0, -42]}
            closeButton={false}
            className="custom-popup"
          >
            <div className="w-full overflow-hidden bg-white" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {/* Photo */}
              <div className="relative h-36 bg-gray-100">
                {activeHit.coverPhoto ? (
                  <img
                    src={activeHit.coverPhoto}
                    alt={activeHit.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
                    <MapPin size={32} />
                  </div>
                )}
                <span style={{
                  position: 'absolute', top: 8, left: 8,
                  background: '#2563eb', color: '#fff',
                  fontSize: 11, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  textTransform: 'capitalize',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {activeHit.listingType}
                </span>
                <button
                  onClick={() => setActiveId(null)}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(255,255,255,0.9)', border: 'none',
                    borderRadius: '50%', width: 24, height: 24,
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    color: '#111827', transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Info */}
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, marginBottom: 4, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeHit.title}
                </p>
                <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📍 {activeHit.locality}, {activeHit.city}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: '#2563eb' }}>
                    {formatPrice(activeHit.price, activeHit.listingType)}
                  </p>
                  <div style={{ fontSize: 12, color: '#4b5563', display: 'flex', gap: 10, fontWeight: 500 }}>
                    {activeHit.bedrooms > 0 && <span>🛏 {activeHit.bedrooms}</span>}
                    {activeHit.area > 0 && <span>📐 {activeHit.area}</span>}
                  </div>
                </div>
                <a
                  href={`/properties/${activeHit.objectID}`}
                  style={{
                    display: 'block', textAlign: 'center',
                    background: '#2563eb', color: '#fff',
                    fontSize: 13, fontWeight: 600,
                    padding: '8px 0', borderRadius: 8,
                    textDecoration: 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
                >
                  View full details
                </a>
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>

      {/* No coords notice */}
      {
        propertiesWithCoords.length === 0 && hits.length > 0 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 999,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', textAlign: 'center', color: '#9ca3af'
          }}>
            <MapPin size={36} style={{ marginBottom: 8, color: '#d1d5db' }} />
            <p style={{ fontWeight: 600 }}>No pinned locations for current results</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Properties listed without coordinates</p>
          </div>
        )
      }
    </div >
  );
}