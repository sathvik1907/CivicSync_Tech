import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Calendar } from 'lucide-react';

export function StatusBadge({ status, type = 'execution' }) {
  if (type === 'health') {
    if (status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5" />
          Overdue
        </span>
      );
    }
    if (status === 'behind_plan') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          Behind Plan
        </span>
      );
    }
    if (status === 'stale') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          <Clock className="w-3.5 h-3.5" />
          Stale (&gt;14d)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        On Track
      </span>
    );
  }

  // Execution state badges
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    case 'Ongoing':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          <Clock className="w-3.5 h-3.5" />
          Ongoing
        </span>
      );
    case 'Planned':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <Calendar className="w-3.5 h-3.5" />
          Planned
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status || 'Unknown'}
        </span>
      );
  }
}
