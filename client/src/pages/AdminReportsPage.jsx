import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRight,
  UserCheck,
  Send,
  Building2,
  X
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function AdminReportsPage() {
  const { user, isCoordinator } = useAuth();
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Action Modal State
  const [activeReport, setActiveReport] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'ASSIGN', 'RESOLVE', 'REJECT'
  const [responseText, setResponseText] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [targetDept, setTargetDept] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadReports();
    loadDepartments();
  }, [selectedStatus]);

  async function loadReports() {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (selectedStatus) query.set('status', selectedStatus);
      query.set('limit', '50');

      const data = await api.get(`/api/v1/reports/admin?${query.toString()}`);
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load admin reports:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const data = await api.get('/api/v1/reference-data');
      setDepartments(data.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  }

  async function handleActionSubmit(e) {
    e.preventDefault();
    if (!activeReport || !modalAction) return;
    setActionError('');
    setActionLoading(true);

    try {
      const payload = {
        action: modalAction,
        response: responseText.trim(),
        rejectionReason: rejectionReason.trim(),
        departmentId: targetDept || undefined
      };

      await api.post(`/api/v1/reports/${activeReport._id}/actions`, payload);
      setActiveReport(null);
      setModalAction(null);
      setResponseText('');
      setRejectionReason('');
      loadReports();
    } catch (err) {
      setActionError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleQuickTransition(report, action) {
    if (!window.confirm(`Confirm status change to ${action} for report ${report.referenceCode}?`)) return;
    try {
      await api.post(`/api/v1/reports/${report._id}/actions`, { action });
      loadReports();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Citizen Reports Review & Action Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce official accountability: triage, assign departments, and commit durable public resolutions
          </p>
        </div>

        {/* Filter by Status */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ticket Ref</th>
                <th className="py-3.5 px-4">Category & Narrative</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <Link to={`/reports/${r._id}`} className="hover:text-emerald-700">
                      {r.referenceCode}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{r.category}</span>
                    <p className="text-slate-500 line-clamp-1 max-w-sm mt-0.5">{r.description}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div>{r.privateLocation?.locality || 'Locality'}</div>
                    <div className="text-[11px] text-slate-400">{r.privateLocation?.city || 'Chennai'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {r.department ? (
                      <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {r.department?.code || r.department?.name}
                      </span>
                    ) : (
                      <span className="font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                        Unassigned Queue
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      r.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : r.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {r.status === 'Submitted' && (
                      <button
                        onClick={() => handleQuickTransition(r, 'REVIEW')}
                        className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-semibold text-[11px]"
                      >
                        Start Review
                      </button>
                    )}

                    {r.status === 'Under Review' && (
                      <button
                        onClick={() => {
                          setActiveReport(r);
                          setModalAction('ASSIGN');
                          setTargetDept(r.department?._id || '');
                        }}
                        className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-semibold text-[11px]"
                      >
                        Assign Dept
                      </button>
                    )}

                    {r.status === 'Assigned' && (
                      <button
                        onClick={() => handleQuickTransition(r, 'START_WORK')}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold text-[11px]"
                      >
                        Start Work
                      </button>
                    )}

                    {r.status === 'In Progress' && (
                      <button
                        onClick={() => {
                          setActiveReport(r);
                          setModalAction('RESOLVE');
                          setResponseText('');
                        }}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold text-[11px]"
                      >
                        Resolve
                      </button>
                    )}

                    {r.status !== 'Resolved' && r.status !== 'Rejected' && (
                      <button
                        onClick={() => {
                          setActiveReport(r);
                          setModalAction('REJECT');
                          setRejectionReason('');
                        }}
                        className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold text-[11px]"
                      >
                        Reject
                      </button>
                    )}

                    <Link
                      to={`/reports/${r._id}`}
                      className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-semibold text-[11px] inline-block"
                    >
                      Audit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog Modal */}
      {modalAction && activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {modalAction === 'RESOLVE' && 'Issue Resolution Statement'}
                  {modalAction === 'REJECT' && 'Mandatory Rejection Rationale'}
                  {modalAction === 'ASSIGN' && 'Assign Department & Officer'}
                </h3>
                <span className="font-mono text-slate-400">{activeReport.referenceCode}</span>
              </div>
              <button onClick={() => { setModalAction(null); setActiveReport(null); }}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium">{actionError}</div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              {modalAction === 'ASSIGN' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Department *</label>
                  <select
                    required
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200"
                  >
                    <option value="">Choose department...</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {modalAction === 'RESOLVE' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Official Resolution Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe specific engineering repairs completed at site, crew dispatched, inspection verification..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              {modalAction === 'REJECT' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mandatory Rejection Explanation *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="State reason why this report cannot proceed (e.g. duplicate submission, private property outside municipal jurisdiction, verified non-issue)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalAction(null); setActiveReport(null); }}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-4 py-2 font-bold text-white rounded-xl ${
                    modalAction === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {actionLoading ? 'Saving...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
