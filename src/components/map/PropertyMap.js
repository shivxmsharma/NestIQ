'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X } from 'lucide-react';
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
  const bgColor = isActive ? '#4f46e5' : '#1e293b';
  const textColor = isActive ? '#ffffff' : '#f8fafc';
  const borderColor = isActive ? '#6366f1' : '#334155';

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
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 z-10 backdrop-blur-sm bg-[#0b1120]/50">
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
          background: rgba(11, 17, 32, 0.85);
          backdrop-filter: blur(12px);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 240px !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(11, 17, 32, 0.85);
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
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
            <div className="w-full overflow-hidden bg-transparent" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {/* Photo */}
              <div className="relative h-36 bg-white/5">
                {activeHit.coverPhoto ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activeHit.coverPhoto}
                    alt={activeHit.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <MapPin size={32} />
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,17,32,0.8), transparent)' }} />
                <span style={{
                  position: 'absolute', top: 8, left: 8,
                  background: 'rgba(79, 70, 229, 0.2)', color: '#c7d2fe',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  backdropFilter: 'blur(4px)'
                }}>
                  {activeHit.listingType === 'pg' ? 'PG' : activeHit.listingType}
                </span>
                <button
                  onClick={() => setActiveId(null)}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%', width: 24, height: 24,
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    color: '#fff', transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Info */}
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3, marginBottom: 4, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeHit.title}
                </p>
                <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📍 {activeHit.locality}, {activeHit.city}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <p style={{ fontWeight: 800, fontSize: 15, color: '#818cf8', letterSpacing: '-0.02em' }}>
                    {formatPrice(activeHit.price, activeHit.listingType)}
                  </p>
                  <div style={{ fontSize: 12, display: 'flex', gap: 10, fontWeight: 500, color: '#cbd5e1' }}>
                    {activeHit.bedrooms > 0 && <span>🛏 {activeHit.bedrooms}</span>}
                    {activeHit.area > 0 && <span>📐 {activeHit.area}</span>}
                  </div>
                </div>
                <a
                  href={`/properties/${activeHit.objectID}`}
                  style={{
                    display: 'block', textAlign: 'center',
                    background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8',
                    border: '1px solid rgba(79, 70, 229, 0.4)',
                    fontSize: 12, fontWeight: 600,
                    padding: '8px 0', borderRadius: 8,
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.25)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.15)'; e.currentTarget.style.color = '#818cf8'; }}
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
            background: 'rgba(11, 17, 32, 0.85)', /* dark glassmorphic */
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', textAlign: 'center', color: '#94a3b8'
          }}>
            <MapPin size={36} style={{ marginBottom: 8, color: '#64748b' }} />
            <p style={{ fontWeight: 600, color: '#e2e8f0' }}>No pinned locations for current results</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Properties listed without coordinates</p>
          </div>
        )
      }
    </div >
  );
}