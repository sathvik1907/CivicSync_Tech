import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  AlertTriangle,
  Info,
  X,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ConflictAlert } from '../components/ConflictAlert.jsx';

export function AdminCoordinationPage() {
  const { user, isCoordinator } = useAuth();
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal State
  const [activeConflict, setActiveConflict] = useState(null);
  const [decisionType, setDecisionType] = useState('Coordinated'); // 'Coordinated', 'Rescheduled', 'Dismissed'
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConflicts();
  }, []);

  async function loadConflicts() {
    setLoading(true);
    try {
      const data = await api.get('/api/v1/conflicts');
      setConflicts(data.conflicts || []);
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecisionSubmit(e) {
    e.preventDefault();
    if (!activeConflict) return;
    setError('');
    setSaving(true);

    try {
      const payload = {
        projectAId: activeConflict.projectA.id,
        projectBId: activeConflict.projectB.id,
        ruleId: activeConflict.matches[0]?.ruleId || 'COORDINATION_RULE',
        decision: decisionType,
        explanation: explanation.trim()
      };

      await api.post('/api/v1/conflicts/decision', payload);
      setActiveConflict(null);
      setExplanation('');
      loadConflicts();
    } catch (err) {
      setError(err.message || 'Failed to record decision.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
          Explainable Inter-Departmental Coordination
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Rule-based cross-department conflict detection. Identify shared road corridors, overlapping excavation schedules,
          and repeated trenching before citizen disruption occurs.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-slate-200 p-6 h-64" />
          ))}
        </div>
      ) : conflicts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Active Coordination Conflicts Detected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All published projects currently operate on distinct road segments or non-overlapping schedules.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {conflicts.map((c) => {
            const isResolved = c.status !== 'Open';
            return (
              <div
                key={c.pairKey}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6"
              >
                {/* Pair Comparison Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                      Pair: {c.projectA.projectCode} ↔ {c.projectB.projectCode}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  {isCoordinator && (
                    <button
                      onClick={() => {
                        setActiveConflict(c);
                        setDecisionType(c.decision?.decision || 'Coordinated');
                        setExplanation(c.decision?.explanation || '');
                        setError('');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors self-start md:self-auto"
                    >
                      {c.decision ? 'Update Resolution Decision' : 'Record Municipal Decision'}
                    </button>
                  )}
                </div>

                {/* Side-by-Side Projects Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Project A */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                        {c.projectA.projectCode}
                      </span>
                      <span className="text-slate-500 font-medium">{c.projectA.department?.name}</span>
                    </div>
                    <Link to={`/projects/${c.projectA.id}`}>
                      <h4 className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors">
                        {c.projectA.title}
                      </h4>
                    </Link>
                    <div className="text-slate-500">
                      Dates: <strong className="text-slate-800">{c.projectA.plannedStartDate}</strong> to <strong className="text-slate-800">{c.projectA.originalDeadline}</strong>
                    </div>
                    {c.projectA.roadSegmentIds?.length > 0 && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Segments: {c.projectA.roadSegmentIds.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Project B */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                        {c.projectB.projectCode}
                      </span>
                      <span className="text-slate-500 font-medium">{c.projectB.department?.name}</span>
                    </div>
                    <Link to={`/projects/${c.projectB.id}`}>
                      <h4 className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors">
                        {c.projectB.title}
                      </h4>
                    </Link>
                    <div className="text-slate-500">
                      Dates: <strong className="text-slate-800">{c.projectB.plannedStartDate}</strong> to <strong className="text-slate-800">{c.projectB.originalDeadline}</strong>
                    </div>
                    {c.projectB.roadSegmentIds?.length > 0 && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Segments: {c.projectB.roadSegmentIds.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Conflict Alert component */}
                <ConflictAlert conflict={c} />
              </div>
            );
          })}
        </div>
      )}

      {/* Record Decision Modal */}
      {activeConflict && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Coordination Decision</h3>
                <span className="font-mono text-slate-400">{activeConflict.projectA.projectCode} ↔ {activeConflict.projectB.projectCode}</span>
              </div>
              <button onClick={() => setActiveConflict(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium">{error}</div>
            )}

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Decision Outcome *</label>
                <select
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold"
                >
                  <option value="Coordinated">Coordinated (Joint Site Protocol Agreed)</option>
                  <option value="Rescheduled">Rescheduled (Staggered Execution Timeline)</option>
                  <option value="Dismissed">Dismissed (Evaluated Non-Conflict)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Public Justification & Inter-Departmental Protocol *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the operational resolution: which department digs first, joint compaction standards, staggered work shifts, or why the alert is dismissed..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveConflict(null)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  {saving ? 'Recording...' : 'Commit Binding Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
