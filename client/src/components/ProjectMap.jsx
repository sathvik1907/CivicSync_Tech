import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';

// Create custom colored SVG marker icons to avoid missing png issues
function createCustomIcon(status = 'Ongoing') {
  let bgColor = '#2563eb'; // blue
  if (status === 'Completed') bgColor = '#059669'; // emerald
  if (status === 'Planned') bgColor = '#64748b'; // slate

  const svgHtml = `
    <div style="
      background-color: ${bgColor};
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  return null;
}

export function ProjectMap({ projects = [], selectedCity = 'Chennai' }) {
  // Default coordinate centers for supported cities [lat, lon]
  const cityCenters = {
    Chennai: [13.0450, 80.2400],
    Bengaluru: [12.9550, 77.6600],
    Hyderabad: [17.4400, 78.3700]
  };

  const center = cityCenters[selectedCity] || cityCenters.Chennai;

  const validProjects = projects.filter(
    (p) => p.location?.coordinates && Array.isArray(p.location.coordinates)
  );

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={12} />

        {validProjects.map((p) => {
          // GeoJSON is [lon, lat], Leaflet expects [lat, lon]
          const lat = p.location.coordinates[1];
          const lon = p.location.coordinates[0];
          const icon = createCustomIcon(p.executionState);

          return (
            <Marker key={p._id || p.id} position={[lat, lon]} icon={icon}>
              <Popup className="civicsync-popup">
                <div className="w-64 p-1 space-y-2">
                  {p.featuredImage && (
                    <img
                      src={p.featuredImage}
                      alt={p.title}
                      className="w-full h-28 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/images/projects/road_resurfacing_omr.jpg';
                      }}
                    />
                  )}
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="font-mono text-slate-500">{p.projectCode}</span>
                    <StatusBadge status={p.executionState} type="execution" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">
                    {p.title}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    {p.locality}, {p.city}
                  </div>
                  <Link
                    to={`/projects/${p._id || p.id}`}
                    className="block text-center w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    View Project Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
