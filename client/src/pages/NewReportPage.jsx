import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Send,
  Camera,
  MapPin,
  Building2,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function NewReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isResident, isOfficial } = useAuth();

  const preselectedProjectId = searchParams.get('projectId') || '';

  const [category, setCategory] = useState('Potholes');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Chennai');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(13.0450);
  const [lon, setLon] = useState(80.2400);
  const [projectId, setProjectId] = useState(preselectedProjectId);
  const [projectsList, setProjectsList] = useState([]);

  // Image uploads (up to 3)
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdReport, setCreatedReport] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await api.get('/api/v1/projects?limit=50');
        setProjectsList(data.projects || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    }
    loadProjects();
  }, []);

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

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaUrls.length >= 3) {
      alert('You can upload a maximum of 3 photographs.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Photograph exceeds 2MB limit.');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'resident_evidence');

      const res = await api.post('/api/v1/media/upload', formData, { isFormData: true });
      if (res.media?.url) {
        setMediaUrls((prev) => [...prev, res.media.url]);
      }
    } catch (err) {
      setError(err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  function removeMedia(idx) {
    setMediaUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/reports/new' } } });
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description of the civic issue.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const payload = {
        category,
        description: description.trim(),
        projectId: projectId || null,
        privateLocation: {
          address: address.trim(),
          locality: locality.trim() || 'Central',
          city,
          coordinates: [Number(lon), Number(lat)]
        },
        mediaUrls
      };

      const result = await api.post('/api/v1/reports', payload);
      setCreatedReport(result);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please check required fields.');
    } finally {
      setSubmitting(false);
    }
  }

  // Success Confirmation State
  if (createdReport) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Civic Report Successfully Submitted!
          </h2>
          <p className="text-sm text-slate-500">
            Your issue has been recorded in the database and assigned a durable tracking reference.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 text-xs">
          <div className="text-slate-400 font-bold uppercase tracking-wider">Durable Tracking Reference</div>
          <div className="text-2xl font-black font-mono text-emerald-700">{createdReport.referenceCode}</div>
          <div className="text-slate-500 pt-1">
            Category: <strong>{createdReport.category}</strong> • Status: <strong>{createdReport.status}</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/reports/${createdReport.id}`}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Track Report Details & Responses
          </Link>
          <Link
            to="/my-reports"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            View All My Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Public Works or Municipal Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Report potholes, damaged footpaths, waterlogging, broken pipes, or poor construction.
          Reports linked to projects route immediately to the responsible department.
        </p>
      </div>

      {!user && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You need to be signed in to submit and track a report.</span>
          </div>
          <Link to="/login" className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg shrink-0">
            Sign In First
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
        {/* Category & Project Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Issue Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Link to Project (Optional)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium outline-none focus:border-emerald-500"
            >
              <option value="">No linked project (Location issue only)</option>
              {projectsList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectCode} - {p.title}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 block">
              Linking a project routes the ticket directly to its owning department.
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Detailed Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue, hazard level, exact landmark, and how long the problem has persisted..."
            className="w-full p-3.5 rounded-xl border border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs leading-relaxed"
          />
        </div>

        {/* Location Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Location Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              >
                <option value="Chennai">Chennai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Locality / Area *</label>
              <input
                type="text"
                required
                placeholder="e.g. Taramani, Guindy"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Street / Landmark</label>
              <input
                type="text"
                placeholder="e.g. Near Tidel Park Gate 2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Photo Uploads (Max 3) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              Evidence Photographs (Max 3)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {mediaUrls.length}/3 Uploaded
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {mediaUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeMedia(idx)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {mediaUrls.length < 3 && (
              <label className="aspect-video rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-600">
                  {uploadingImage ? 'Uploading...' : 'Add Photograph'}
                </span>
                <span className="text-[10px] text-slate-400">JPEG, PNG, WebP &le; 2MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImage}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Privacy Shield Notice */}
        <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-[11px] text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Resident Evidence Protection:</strong> Your photographs and exact household location are strictly confidential. Only you and authorized municipal officials can view them.
          </span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? 'Persisting to Database...' : 'Submit Civic Report'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
