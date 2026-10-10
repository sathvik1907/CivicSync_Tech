import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Map as MapIcon,
  List,
  MapPin,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers
} from 'lucide-react';
import { api } from '../services/api.js';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { ProjectMap } from '../components/ProjectMap.jsx';

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states derived from URL search params
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || 'Chennai';
  const locality = searchParams.get('locality') || '';
  const department = searchParams.get('department') || '';
  const workType = searchParams.get('workType') || '';
  const status = searchParams.get('status') || '';
  const delayState = searchParams.get('delayState') || '';
  const viewMode = searchParams.get('view') || 'list'; // 'list' or 'map'

  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch reference data (departments, etc.)
  useEffect(() => {
    async function loadReferenceData() {
      try {
        const data = await api.get('/api/v1/reference-data');
        setDepartments(data.departments || []);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    }
    loadReferenceData();
  }, []);

  // Fetch projects matching filters
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (city) queryParams.set('city', city);
        if (locality) queryParams.set('locality', locality);
        if (department) queryParams.set('department', department);
        if (workType) queryParams.set('workType', workType);
        if (status) queryParams.set('status', status);
        if (delayState) queryParams.set('delayState', delayState);
        queryParams.set('limit', '50');

        const data = await api.get(`/api/v1/projects?${queryParams.toString()}`);
        setProjects(data.projects || []);
        setTotalCount(data.pagination?.total || (data.projects || []).length);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [search, city, locality, department, workType, status, delayState]);

  function updateFilter(key, value) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams);
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams({ city: 'Chennai', view: viewMode }));
  }

  // Work types available in system
  const workTypes = [
    'Road Resurfacing',
    'Stormwater Drainage',
    'Water Pipeline',
    'Footpath Construction',
    'Streetlight Installation',
    'Underground Cables',
    'Pothole Repair',
    'Drainage Repair'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            Civic Transparency Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Discover Nearby Municipal Infrastructure Works
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Real-time tracking of public works, budgets, contractors, inter-departmental conflicts, and milestone progress across Indian cities.
          </p>

          {/* City Selection Tabs */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-1">Select City:</span>
            {['Chennai', 'Bengaluru', 'Hyderabad'].map((cityName) => (
              <button
                key={cityName}
                onClick={() => updateFilter('city', cityName)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  city === cityName
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {cityName}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Search & View Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project name, locality, department, or road segment..."
              value={search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Map vs List View Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                type="button"
                onClick={() => updateFilter('view', 'list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
              <button
                type="button"
                onClick={() => updateFilter('view', 'map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Map View
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
          {/* Work Type Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Work Type
            </label>
            <select
              value={workType}
              onChange={(e) => updateFilter('workType', e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-emerald-500"
            >
              <option value="">All Types</option>
              {workTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => updateFilter('department', e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-emerald-500"
            >
              <option value="">All Departments</option>
              {departments
                .filter((d) => !city || d.city.toLowerCase() === city.toLowerCase())
                .map((d) => (
                  <option key={d._id} value={d._id}>{d.code} - {d.name}</option>
                ))}
            </select>
          </div>

          {/* Execution Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="Planned">Planned</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Delay / Health Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Accountability State
            </label>
            <select
              value={delayState}
              onChange={(e) => updateFilter('delayState', e.target.value)}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-emerald-500"
            >
              <option value="">All Health States</option>
              <option value="overdue">Overdue Deadline</option>
              <option value="behind_plan">Behind Plan (&ge;10%)</option>
              <option value="stale">Stale Updates (&gt;14d)</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full py-2 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <strong className="text-slate-900 font-bold">{projects.length}</strong> public infrastructure works in <strong className="text-slate-900 font-bold">{city}</strong>
        </div>
      </div>

      {/* Main View Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl h-80 border border-slate-200 p-4 space-y-4">
              <div className="w-full h-40 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No public projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing status filters, or switching cities.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'map' ? (
        <div className="space-y-4">
          <ProjectMap projects={projects} selectedCity={city} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((proj) => (
              <ProjectCard key={proj._id} project={proj} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard key={proj._id} project={proj} />
          ))}
        </div>
      )}
    </div>
  );
}
