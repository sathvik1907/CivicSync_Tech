import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  User,
  ShieldCheck,
  Calendar,
  XCircle
} from 'lucide-react';
import { api } from '../services/api.js';

export function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/api/v1/reports/${id}`);
        setReport(data.report);
      } catch (err) {
        setError(err.message || 'Unable to retrieve report details.');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500">{error || 'Report could not be retrieved.'}</p>
        <Link
          to="/my-reports"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Reports
        </Link>
      </div>
    );
  }

  const {
    referenceCode,
    category,
    description,
    status,
    officialResponse,
    rejectionReason,
    statusHistory = [],
    mediaUrls = [],
    privateLocation = {},
    project,
    department,
    createdAt
  } = report;

  // Workflow steps definition
  const steps = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
  const currentStepIdx = steps.indexOf(status);
  const isRejected = status === 'Rejected';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          to="/my-reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>
      </div>

      {/* Main Ticket Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                {referenceCode}
              </span>
              <span className="font-semibold text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                {category}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Submitted on {new Date(createdAt).toLocaleString()}
            </div>
          </div>

          <div>
            {isRejected ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <XCircle className="w-4 h-4" />
                Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                {status}
              </span>
            )}
          </div>
        </div>

        {/* Workflow Progression Stepper */}
        {!isRejected ? (
          <div className="py-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Official Resolution Progress
            </div>
            <div className="grid grid-cols-5 gap-2 relative">
              {steps.map((st, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <div key={st} className="text-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] block font-medium leading-tight ${
                        isCurrent ? 'font-bold text-emerald-800' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Report Not Proceeding (Rejection Rationale)
            </div>
            <p className="text-rose-800">{rejectionReason || 'No specific rationale supplied.'}</p>
          </div>
        )}

        {/* Description & Location */}
        <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Citizen Description
            </span>
            <p className="text-slate-800 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Reported Location</span>
              <strong className="text-slate-800">
                {privateLocation.address ? `${privateLocation.address}, ` : ''}{privateLocation.locality}, {privateLocation.city}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Assigned Department</span>
              <strong className="text-slate-800">
                {department?.name || 'Municipal Routing Queue'}
              </strong>
            </div>
          </div>

          {project && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-emerald-800 text-[11px] block font-semibold">Associated Infrastructure Project</span>
                <strong className="text-emerald-950 text-xs">{project.title} ({project.projectCode})</strong>
              </div>
              <Link
                to={`/projects/${project._id}`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                View Project
              </Link>
            </div>
          )}
        </div>

        {/* Attached Photographs (Private Evidence) */}
        {mediaUrls.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submitted Photographs ({mediaUrls.length})
              </span>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Protected Resident Delivery
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaUrls.map((url, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={url} alt={`Evidence photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Official Audit Trail & Status History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          Official Review & Response History
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {statusHistory.map((h, idx) => (
            <div key={idx} className="relative space-y-1">
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-900">{h.status}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-mono">
                  {new Date(h.changedAt).toLocaleString()}
                </span>
                {h.changedBy && (
                  <span className="text-slate-600">
                    by <strong>{h.changedBy.displayName || 'Authorized Official'}</strong>
                  </span>
                )}
              </div>
              {h.response && (
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {h.response}
                </p>
              )}
              {h.reason && (
                <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  Reason: {h.reason}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
