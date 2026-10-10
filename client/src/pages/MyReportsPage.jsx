import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, CheckCircle2, Clock, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function MyReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyReports() {
      setLoading(true);
      try {
        const data = await api.get('/api/v1/reports/mine');
        setReports(data.reports || []);
      } catch (err) {
        console.error('Failed to load my reports:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyReports();
  }, []);

  function getStatusBadge(status) {
    switch (status) {
      case 'Resolved':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Resolved</span>;
      case 'In Progress':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">In Progress</span>;
      case 'Assigned':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Assigned</span>;
      case 'Under Review':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Under Review</span>;
      case 'Rejected':
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Rejected</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold">Submitted</span>;
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submitted Civic Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track official department reviews, assignments, and resolution updates in real time
          </p>
        </div>

        <Link
          to="/reports/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          File New Report
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 h-32" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No reports filed yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't submitted any civic issue reports. Spot a pothole, broken footpath, or water leak?
          </p>
          <Link
            to="/reports/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Submit Your First Report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                    {r.referenceCode}
                  </span>
                  <span className="font-semibold text-xs text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {r.category}
                  </span>
                  {getStatusBadge(r.status)}
                </div>

                <div className="text-xs text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>

                {r.project && (
                  <div className="text-[11px] text-emerald-800 pt-1">
                    Linked to Project: <strong>{r.project.title}</strong> ({r.project.projectCode})
                  </div>
                )}
              </div>

              {/* Official response preview */}
              {r.officialResponse && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950">
                  <div className="font-bold text-[11px] text-emerald-800 uppercase tracking-wider mb-0.5">
                    Latest Official Response:
                  </div>
                  <p>{r.officialResponse}</p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {r.mediaUrls?.length || 0} Evidence Photos Attached
                </span>
                <Link
                  to={`/reports/${r._id}`}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>View Details & History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
