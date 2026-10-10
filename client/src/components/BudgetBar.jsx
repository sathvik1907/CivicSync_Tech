import React from 'react';
import { IndianRupee, PieChart, TrendingUp } from 'lucide-react';

export function formatINR(paise) {
  if (paise === null || paise === undefined) return 'Not available';
  const rupees = paise / 100;
  if (Math.abs(rupees) >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(rupees) >= 100000) {
    return `₹${(rupees / 100000).toFixed(2)} Lakh`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export function BudgetBar({ estimatedPaise, expenditurePaise, budgetMetrics }) {
  const hasEstimate = estimatedPaise !== null && estimatedPaise !== undefined;
  const hasExpenditure = expenditurePaise !== null && expenditurePaise !== undefined;

  if (!hasEstimate && !hasExpenditure) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 flex items-center justify-between">
        <span>Budget data:</span>
        <span className="font-medium text-slate-700">Not available (Demonstration record)</span>
      </div>
    );
  }

  const utilization = budgetMetrics?.utilizationPercent ?? (
    hasEstimate && estimatedPaise > 0 && hasExpenditure
      ? Math.round((expenditurePaise / estimatedPaise) * 1000) / 10
      : null
  );

  const remaining = budgetMetrics?.remainingBudgetPaise ?? (
    hasEstimate && hasExpenditure ? estimatedPaise - expenditurePaise : null
  );

  const isOverBudget = remaining !== null && remaining < 0;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-emerald-600" />
          Financial Transparency
        </span>
        {utilization !== null && (
          <span className={`px-2 py-0.5 rounded font-mono ${isOverBudget ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {utilization}% Utilized
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-xs text-slate-500">Approved Estimate</div>
          <div className="font-bold text-slate-900 mt-0.5">{formatINR(estimatedPaise)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Reported Expenditure</div>
          <div className="font-bold text-slate-900 mt-0.5">{formatINR(expenditurePaise)}</div>
        </div>
        {remaining !== null && (
          <div className="col-span-2 md:col-span-1">
            <div className="text-xs text-slate-500">Remaining Budget</div>
            <div className={`font-bold mt-0.5 ${isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
              {formatINR(remaining)}
              {isOverBudget && <span className="text-xs font-normal text-rose-500 ml-1">(Overrun)</span>}
            </div>
          </div>
        )}
      </div>

      {utilization !== null && (
        <div className="space-y-1">
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-emerald-600'}`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0%</span>
            <span>100% Target</span>
          </div>
        </div>
      )}
    </div>
  );
}
