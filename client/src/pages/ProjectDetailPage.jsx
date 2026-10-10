import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowLeft,
  Share2,
  HardHat,
  ShieldCheck,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { BudgetBar, formatINR } from '../components/BudgetBar.jsx';
import { MilestoneTracker } from '../components/MilestoneTracker.jsx';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider.jsx';
import { ConflictAlert } from '../components/ConflictAlert.jsx';

export function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/api/v1/projects/${id}`);
        setProject(data.project);

        // Fetch conflicts for this project
        try {
          const conflictData = await api.get(`/api/v1/conflicts/project/${id}`);
          setConflicts(conflictData.conflicts || []);
        } catch {
          // Conflicts endpoint optional
        }
      } catch (err) {
        setError(err.message || 'Project not found');
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 rounded-xl md:col-span-2" />
          <div className="h-48 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Project Record Not Found</h2>
        <p className="text-sm text-slate-500">{error || 'Unable to retrieve project details.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Explore
        </Link>
      </div>
    );
  }

  const {
    projectCode,
    title,
    description,
    purpose,
    workType,
    city,
    locality,
    department,
    contractor,
    executionState,
    plannedStartDate,
    originalDeadline,
    revisedForecastDate,
    actualStartDate,
    actualCompletionDate,
    delayExplanation,
    estimatedBudgetPaise,
    actualExpenditurePaise,
    milestones,
    health = {},
    budgetMetrics = {},
    beforeAfterPair,
    updates = [],
    featuredImage,
    sourceLabel,
    lastUpdatedAt
  } = project;

  const imageSrc = featuredImage || '/images/projects/road_resurfacing_omr.jpg';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                {projectCode}
              </span>
              <StatusBadge status={executionState} type="execution" />
              {health.isOverdue && <StatusBadge status="overdue" type="health" />}
              {health.isBehindPlan && <StatusBadge status="behind_plan" type="health" />}
              {health.isStale && <StatusBadge status="stale" type="health" />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <Building2 className="w-4 h-4 text-emerald-600" />
                {department?.name || 'Department of Municipal Works'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {locality}, {city}
              </span>
              <span className="text-slate-400">•</span>
              <span>Work Type: <strong className="text-slate-800">{workType}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <Link
              to={`/reports/new?projectId=${project._id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all shadow-emerald-600/20"
            >
              <Send className="w-4 h-4" />
              Report Issue on this Project
            </Link>
          </div>
        </div>

        {/* Project Purpose Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-sm text-slate-700 space-y-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Approved Civic Purpose
          </div>
          <p className="font-medium text-slate-800">{purpose}</p>
          {description && (
            <p className="text-xs text-slate-600 pt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>

      {/* Coordination Warning Alert if any active conflict */}
      {conflicts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Inter-Departmental Coordination Notice</h2>
          {conflicts.map((c, idx) => (
            <ConflictAlert key={idx} conflict={c} />
          ))}
        </div>
      )}

      {/* Grid: Timeline & Financials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schedule & Milestones Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Execution Timeline & Dates
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Planned Start</span>
              <strong className="text-slate-800 text-sm">{plannedStartDate || 'Not available'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Original Deadline</span>
              <strong className="text-slate-800 text-sm">{originalDeadline || 'Not available'}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Revised Forecast</span>
              <strong className={`text-sm ${revisedForecastDate ? 'text-amber-700' : 'text-slate-800'}`}>
                {revisedForecastDate || 'None (On Schedule)'}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Actual Completion</span>
              <strong className={`text-sm ${actualCompletionDate ? 'text-emerald-700' : 'text-slate-500'}`}>
                {actualCompletionDate || 'Pending completion'}
              </strong>
            </div>
          </div>

          {/* Delay explanation notice if applicable */}
          {delayExplanation && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Official Delay Reason
              </div>
              <p className="text-amber-800">{delayExplanation}</p>
            </div>
          )}
        </div>

        {/* Contractor & Budget Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HardHat className="w-4 h-4 text-emerald-600" />
              Contractor & Expenditure
            </h3>

            {/* Contractor Information */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <span className="text-slate-400 block">Assigned Contractor</span>
              <div className="font-bold text-slate-900 text-sm">
                {contractor?.name || 'Contractor information pending assignment'}
              </div>
              {contractor?.registrationNumber && (
                <div className="text-slate-500 font-mono">
                  Registration: {contractor.registrationNumber}
                </div>
              )}
            </div>

            {/* Budget Bar component */}
            <BudgetBar
              estimatedPaise={estimatedBudgetPaise}
              expenditurePaise={actualExpenditurePaise}
              budgetMetrics={budgetMetrics}
            />
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Last official audit update: {new Date(lastUpdatedAt || Date.now()).toLocaleDateString()}</span>
            <span>Source: {sourceLabel || 'Municipal Database'}</span>
          </div>
        </div>
      </div>

      {/* Milestone Progress Tracker */}
      <MilestoneTracker
        milestones={milestones}
        overallProgress={health.progress ?? 0}
        expectedProgress={health.expectedProgress}
      />

      {/* Before-and-After Visual Evidence Slider */}
      <BeforeAfterSlider pair={beforeAfterPair} />

      {/* Dated Official Updates Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          Official Update History & Field Logs
        </h3>

        {updates.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No inspection log updates recorded yet for this project.
          </p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {updates.map((up) => (
              <div key={up._id} className="relative space-y-1.5">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900">{up.title}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-mono">
                    {new Date(up.publishedAt).toLocaleDateString()}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                    Progress Snapshot: {up.progressSnapshot}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {up.narrative}
                </p>
                <div className="text-[11px] text-slate-400">
                  By {up.author?.displayName || 'Department Engineer'} ({up.sourceProvenance})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
