import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import {
  BarChart3,
  Flame,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';

function MapCenterSetter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 12);
  }, [center, map]);
  return null;
}

export function InsightsPage() {
  const [city, setCity] = useState('Chennai');
  const [category, setCategory] = useState('');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const cityCenters = {
    Chennai: [13.0450, 80.2400],
    Bengaluru: [12.9550, 77.6600],
    Hyderabad: [17.4400, 78.3700]
  };

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (city) query.set('city', city);
        if (category) query.set('category', category);

        const data = await api.get(`/api/v1/insights?${query.toString()}`);
        setInsights(data);
      } catch (err) {
        console.error('Failed to load insights:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, [city, category]);

  const categories = [
    'Potholes',
    'Damaged roads',
    'Drainage problems',
    'Waterlogging',
    'Water pipeline problems',
    'Broken footpaths',
    'Streetlight failures',
    'Exposed cables',
    'Incomplete work',
    'Other civic issues'
  ];

  const center = cityCenters[city] || cityCenters.Chennai;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <BarChart3 className="w-3.5 h-3.5" />
          Community Civic Intelligence
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Public Issues Heatmap & Community Insights
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          Aggregated civic reports clustered into privacy-preserving 250-metre cells. Inspect geographic complaint density and municipal resolution rates without exposing private citizen coordinates.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* City Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">City:</span>
          {['Chennai', 'Bengaluru', 'Hyderabad'].map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                city === c
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Issue Type:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:w-64 py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="text-3xl font-black text-slate-900 font-mono">{insights.totalReports}</div>
            <span className="text-[11px] text-slate-500 block">Verified citizen submissions</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</span>
            <div className="text-3xl font-black text-emerald-700 font-mono">
              {insights.statusCounts?.Resolved || 0}
            </div>
            <span className="text-[11px] text-slate-500 block">Restored by municipality</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</span>
            <div className="text-3xl font-black text-blue-700 font-mono">
              {insights.statusCounts?.['In Progress'] || 0}
            </div>
            <span className="text-[11px] text-slate-500 block">Crews actively on site</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Review</span>
            <div className="text-3xl font-black text-amber-700 font-mono">
              {(insights.statusCounts?.Submitted || 0) + (insights.statusCounts?.['Under Review'] || 0) + (insights.statusCounts?.Assigned || 0)}
            </div>
            <span className="text-[11px] text-slate-500 block">Routing to department</span>
          </div>
        </div>
      )}

      {/* Heatmap Map Viewer */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Approximate 250-Metre Complaint Density Heatmap
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each circle represents an approximate 250m radius neighborhood cluster. Color intensity reflects report count.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {insights?.heatmapCells?.length || 0} Active Clusters Identified
          </div>
        </div>

        <div className="w-full h-[480px] rounded-2xl overflow-hidden border border-slate-200 relative z-0">
          <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="w-full h-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterSetter center={center} />

            {insights?.heatmapCells?.map((cell) => {
              const count = cell.count || 1;
              const radius = Math.min(600, 250 + count * 50);
              let color = '#3b82f6'; // 1-2 reports (blue)
              if (count >= 5) color = '#ef4444'; // 5+ reports (red)
              else if (count >= 3) color = '#f59e0b'; // 3-4 reports (amber)

              return (
                <Circle
                  key={cell.cellId}
                  center={[cell.lat, cell.lon]}
                  radius={radius}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.45,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-bold text-slate-900 flex items-center justify-between gap-2">
                        <span>250m Neighborhood Cell</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">
                          {count} {count === 1 ? 'Report' : 'Reports'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 pt-1">
                        Reported Categories:
                      </div>
                      <div className="space-y-0.5 text-[11px]">
                        {Object.entries(cell.categories || {}).map(([cat, cnt]) => (
                          <div key={cat} className="flex justify-between text-slate-700">
                            <span>{cat}</span>
                            <span className="font-bold">{cnt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Popup>
                </Circle>
              );
            })}
          </MapContainer>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Citizen Privacy Shield:</strong> Exact resident household coordinates, raw text narratives, and uploaded photos are never exposed on this public heatmap. All markers are securely mapped to 250-metre centroid bounds.
          </span>
        </div>
      </div>
    </div>
  );
}
