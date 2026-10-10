import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ConflictAlert({ conflict }) {
  if (!conflict) return null;

  const { matches = [], decision, status = 'Open' } = conflict;

  const isResolved = status === 'Coordinated' || status === 'Rescheduled' || status === 'Dismissed';

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${
      isResolved
        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
        : 'bg-amber-50/80 border-amber-300 text-amber-950'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">
            {isResolved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">
                {isResolved ? 'Inter-Departmental Coordination Protocol Active' : 'Inter-Departmental Work Conflict Detected'}
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isResolved
                  ? 'bg-emerald-200 text-emerald-800'
                  : 'bg-amber-200 text-amber-900'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Cross-department project alignment evaluated by the TransparanceCity coordination engine.
            </p>
          </div>
        </div>
      </div>

      {/* Rules matches list */}
      <div className="space-y-2 pt-1">
        {matches.map((m, idx) => (
          <div key={idx} className="bg-white/80 rounded-lg p-3 border border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900">{m.ruleName}</span>
              <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded">
                Confidence: {m.confidence}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{m.reason}</p>
          </div>
        ))}
      </div>

      {/* Decision explanation if present */}
      {decision && (
        <div className="bg-emerald-100/70 border border-emerald-300/80 rounded-lg p-3 text-xs space-y-1">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-700" />
            Official Coordination Action: {decision.decision}
          </div>
          <p className="text-emerald-800">{decision.explanation}</p>
          <div className="text-[11px] text-emerald-700/80 pt-1">
            Recorded by <strong>{decision.decidedBy}</strong> on {new Date(decision.decidedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
