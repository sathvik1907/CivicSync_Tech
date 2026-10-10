import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit,
  Upload,
  CheckCircle2,
  Calendar,
  Building2,
  AlertCircle,
  X,
  Send,
  Eye
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { formatINR } from '../components/BudgetBar.jsx';

export function AdminProjectsPage() {
  const { user, isCoordinator } = useAuth();
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  // Create Draft Form state
  const [draftData, setDraftData] = useState({
    projectCode: '',
    title: '',
    purpose: '',
    workType: 'Road Resurfacing',
    city: 'Chennai',
    locality: '',
    plannedStartDate: '2026-11-01',
    originalDeadline: '2027-01-15',
    estimatedBudgetRupees: 25000000,
    department: ''
  });

  // Post Update Form state
  const [updateData, setUpdateData] = useState({
    title: '',
    narrative: '',
    progressSnapshot: 50,
    actualExpenditureRupees: 0
  });

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadProjects();
    loadDepartments();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const data = await api.get('/api/v1/projects?limit=100');
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
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

  async function handleCreateDraft(e) {
    e.preventDefault();
    setActionError('');
    try {
      const payload = {
        ...draftData,
        estimatedBudgetPaise: draftData.estimatedBudgetRupees * 100,
        department: draftData.department || user?.department?._id || user?.department,
        milestones: [
          { milestoneId: 'm1', title: 'Phase 1: Site Clearance', weight: 40, dueDate: draftData.plannedStartDate, progress: 0, order: 1 },
          { milestoneId: 'm2', title: 'Phase 2: Construction Works', weight: 40, dueDate: draftData.originalDeadline, progress: 0, order: 2 },
          { milestoneId: 'm3', title: 'Phase 3: Inspection and Commissioning', weight: 20, dueDate: draftData.originalDeadline, progress: 0, order: 3 }
        ]
      };

      await api.post('/api/v1/projects', payload);
      setShowCreateModal(false);
      setActionSuccess('New project draft created successfully.');
      loadProjects();
    } catch (err) {
      setActionError(err.message || 'Failed to create draft.');
    }
  }

  async function handlePostUpdate(e) {
    e.preventDefault();
    if (!activeProject) return;
    setActionError('');
    try {
      const payload = {
        title: updateData.title,
        narrative: updateData.narrative,
        progressSnapshot: Number(updateData.progressSnapshot),
        actualExpenditurePaise: updateData.actualExpenditureRupees ? Number(updateData.actualExpenditureRupees) * 100 : undefined,
        sourceProvenance: `${user.displayName} Inspection Log`
      };

      await api.post(`/api/v1/projects/${activeProject._id}/updates`, payload);
      setShowUpdateModal(false);
      setActionSuccess(`Official progress update recorded for ${activeProject.projectCode}.`);
      loadProjects();
    } catch (err) {
      setActionError(err.message || 'Failed to post update.');
    }
  }

  async function handlePublish(project) {
    if (!window.confirm(`Publish draft project ${project.projectCode} to public transparency portal?`)) return;
    setActionError('');
    try {
      await api.post(`/api/v1/projects/${project._id}/publish`, {});
      setActionSuccess(`Project ${project.projectCode} published successfully.`);
      loadProjects();
    } catch (err) {
      alert(`Publish error: ${err.message}`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Official Project Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain public works, milestone schedules, inspection narratives, and budget utilization
          </p>
        </div>

        <button
          onClick={() => {
            setActionError('');
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Draft Project
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Project Code</th>
                <th className="py-3.5 px-4">Title & Type</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Milestone %</th>
                <th className="py-3.5 px-4">Budget</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {p.projectCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 max-w-xs line-clamp-1">{p.title}</div>
                    <div className="text-[11px] text-slate-400">{p.workType} • {p.locality}, {p.city}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      {p.department?.code || 'GCC'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 items-start">
                      <StatusBadge status={p.executionState} type="execution" />
                      {p.publicationState === 'Draft' && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Draft
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold">
                    {p.health?.progress ?? 0}%
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {formatINR(p.estimatedBudgetPaise)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setActiveProject(p);
                        setUpdateData({
                          title: 'Field Progress Inspection',
                          narrative: '',
                          progressSnapshot: p.health?.progress ?? 50,
                          actualExpenditureRupees: p.actualExpenditurePaise ? p.actualExpenditurePaise / 100 : 0
                        });
                        setActionError('');
                        setShowUpdateModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] transition-colors"
                    >
                      Post Update
                    </button>

                    {p.publicationState === 'Draft' && (
                      <button
                        onClick={() => handlePublish(p)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition-colors"
                      >
                        Publish
                      </button>
                    )}

                    <Link
                      to={`/projects/${p._id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-[11px] transition-colors inline-block"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Draft Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Project Draft</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium">{actionError}</div>
            )}

            <form onSubmit={handleCreateDraft} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Project Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHN-GCC-2026-099"
                  value={draftData.projectCode}
                  onChange={(e) => setDraftData({ ...draftData, projectCode: e.target.value.toUpperCase() })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Full project title..."
                  value={draftData.title}
                  onChange={(e) => setDraftData({ ...draftData, title: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Civic Purpose *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Why is this project approved and what problem does it solve..."
                  value={draftData.purpose}
                  onChange={(e) => setDraftData({ ...draftData, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Work Type</label>
                  <select
                    value={draftData.workType}
                    onChange={(e) => setDraftData({ ...draftData, workType: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="Road Resurfacing">Road Resurfacing</option>
                    <option value="Stormwater Drainage">Stormwater Drainage</option>
                    <option value="Water Pipeline">Water Pipeline</option>
                    <option value="Footpath Construction">Footpath Construction</option>
                    <option value="Streetlight Installation">Streetlight Installation</option>
                    <option value="Underground Cables">Underground Cables</option>
                    <option value="Drainage Repair">Drainage Repair</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <select
                    value={draftData.city}
                    onChange={(e) => setDraftData({ ...draftData, city: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Locality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Taramani"
                    value={draftData.locality}
                    onChange={(e) => setDraftData({ ...draftData, locality: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Est. Budget (₹ Rupees)</label>
                  <input
                    type="number"
                    value={draftData.estimatedBudgetRupees}
                    onChange={(e) => setDraftData({ ...draftData, estimatedBudgetRupees: Number(e.target.value) })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Planned Start</label>
                  <input
                    type="date"
                    value={draftData.plannedStartDate}
                    onChange={(e) => setDraftData({ ...draftData, plannedStartDate: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Original Deadline</label>
                  <input
                    type="date"
                    value={draftData.originalDeadline}
                    onChange={(e) => setDraftData({ ...draftData, originalDeadline: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Official Update Modal */}
      {showUpdateModal && activeProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Post Official Progress Update</h3>
                <span className="font-mono text-slate-400">{activeProject.projectCode}</span>
              </div>
              <button onClick={() => setShowUpdateModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            {actionError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl font-medium">{actionError}</div>
            )}

            <form onSubmit={handlePostUpdate} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Update Heading *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 2 Concrete Pouring Completed"
                  value={updateData.title}
                  onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Field Narrative *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed inspection observations, materials utilized, milestones cleared..."
                  value={updateData.narrative}
                  onChange={(e) => setUpdateData({ ...updateData, narrative: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Progress Snapshot (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={updateData.progressSnapshot}
                    onChange={(e) => setUpdateData({ ...updateData, progressSnapshot: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Updated Expenditure (₹)</label>
                  <input
                    type="number"
                    value={updateData.actualExpenditureRupees}
                    onChange={(e) => setUpdateData({ ...updateData, actualExpenditureRupees: e.target.value })}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  Publish Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
