import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function AdminOverviewPage() {
  const { user, isCoordinator } = useAuth();
  const [stats, setStats] = useState({
    projectsCount: 0,
    overdueCount: 0,
    staleCount: 0,
    reportsCount: 0,
    conflictsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      try {
        const [projRes, repRes, confRes] = await Promise.all([
          api.get('/api/v1/projects?limit=100'),
          api.get('/api/v1/reports/admin?limit=100'),
          api.get('/api/v1/conflicts')
        ]);

        const allProjects = projRes.projects || [];
        const overdue = allProjects.filter((p) => p.health?.isOverdue).length;
        const stale = allProjects.filter((p) => p.health?.isStale).length;

        setStats({
          projectsCount: allProjects.length,
          overdueCount: overdue,
          staleCount: stale,
          reportsCount: repRes.pagination?.total || (repRes.reports || []).length,
          conflictsCount: (confRes.conflicts || []).length
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {isCoordinator ? 'Municipal Coordinator Console' : 'Department Officer Dashboard'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {user?.department?.name || 'Cross-Departmental Oversight'}. Active role: <span className="uppercase font-bold text-emerald-400">{user?.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/projects"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Manage Projects
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Review Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
          <div className="text-3xl font-black text-slate-900 font-mono">{stats.projectsCount}</div>
          <span className="text-[11px] text-slate-500 block">Published infrastructure works</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Overdue Deadlines</span>
          <div className="text-3xl font-black text-rose-700 font-mono">{stats.overdueCount}</div>
          <span className="text-[11px] text-slate-500 block">Requires schedule forecast audit</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Stale Updates (&gt;14d)</span>
          <div className="text-3xl font-black text-purple-700 font-mono">{stats.staleCount}</div>
          <span className="text-[11px] text-slate-500 block">No inspection logs filed</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Coordination Conflicts</span>
          <div className="text-3xl font-black text-amber-700 font-mono">{stats.conflictsCount}</div>
          <span className="text-[11px] text-slate-500 block">Rules A, B, C, D candidates</span>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Projects Management</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create drafts, configure weighted milestones, publish projects, and post official progress updates.
            </p>
          </div>
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-2"
          >
            <span>Open Projects Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Citizen Reports Queue</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Triage resident submissions, assign officers, start field repair work, and issue formal resolution statements.
            </p>
          </div>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-2"
          >
            <span>Open Reports Queue ({stats.reportsCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Coordination Engine</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Inspect overlapping road segments, concurrent excavations, and record binding coordination decisions.
            </p>
          </div>
          <Link
            to="/admin/coordination"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 pt-2"
          >
            <span>Review Active Conflicts ({stats.conflictsCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
