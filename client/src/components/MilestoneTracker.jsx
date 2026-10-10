import React from 'react';
import { CheckCircle2, Clock, Calendar, BarChart2 } from 'lucide-react';

export function MilestoneTracker({ milestones = [], overallProgress, expectedProgress }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-sm text-slate-500">
        No detailed milestone schedule published yet for this project.
      </div>
    );
  }

  const totalWeight = milestones.reduce((sum, m) => sum + (Number(m.weight) || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-600" />
            Weighted Milestone Progress
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Progress is strictly weighted by engineering milestone complexity (Total weights: {totalWeight}%)
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-xs text-slate-500 block">Current Progress</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">{overallProgress}%</span>
          </div>
          {expectedProgress !== undefined && (
            <div className="pl-4 border-l border-slate-200">
              <span className="text-xs text-slate-500 block">Expected by Plan</span>
              <span className="text-lg font-bold text-slate-700 font-mono">{expectedProgress}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, overallProgress))}%` }}
          />
        </div>
      </div>

      {/* Individual Milestones List */}
      <div className="space-y-3 pt-2">
        {milestones.map((m, idx) => {
          const isDone = m.progress === 100;
          return (
            <div
              key={m.milestoneId || idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : m.progress > 0
                  ? 'bg-blue-50/40 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{m.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Target: {m.dueDate}
                      </span>
                      {m.actualCompletionDate && (
                        <span className="text-emerald-700 font-medium">
                          Completed: {m.actualCompletionDate}
                        </span>
                      )}
                      <span className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
                        Weight: {m.weight}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-sm font-bold font-mono ${isDone ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {m.progress}%
                  </span>
                </div>
              </div>

              {/* Progress bar per milestone */}
              <div className="mt-2.5 w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${isDone ? 'bg-emerald-600' : 'bg-blue-600'}`}
                  style={{ width: `${m.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
