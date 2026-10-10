import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { formatINR } from './BudgetBar.jsx';

export function ProjectCard({ project }) {
  const {
    _id,
    projectCode,
    title,
    workType,
    city,
    locality,
    department,
    executionState,
    health = {},
    budgetMetrics = {},
    featuredImage,
    estimatedBudgetPaise,
    actualExpenditurePaise
  } = project;

  const imageSrc = featuredImage || '/images/projects/road_resurfacing_omr.jpg';
  const deptName = department?.code || department?.name || 'Municipal Works';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Thumbnail Header */}
      <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/images/projects/road_resurfacing_omr.jpg';
          }}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <StatusBadge status={executionState} type="execution" />
          {health.isOverdue && <StatusBadge status="overdue" type="health" />}
          {health.isBehindPlan && <StatusBadge status="behind_plan" type="health" />}
          {health.isStale && <StatusBadge status="stale" type="health" />}
        </div>
        <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-mono">
          {projectCode}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <Building2 className="w-3.5 h-3.5" />
              {deptName}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {locality}, {city}
            </span>
          </div>

          <Link to={`/projects/${_id}`}>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 font-medium">
            Type: <span className="text-slate-700">{workType}</span>
          </p>
        </div>

        {/* Progress & Budget Summary */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Milestone Progress</span>
            <span className="font-bold text-slate-900 font-mono">
              {health.progress ?? 0}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, health.progress ?? 0)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
            <div>
              <span className="text-slate-400 text-[11px] block">Est. Cost</span>
              <span className="font-semibold">{formatINR(estimatedBudgetPaise)}</span>
            </div>
            {budgetMetrics.utilizationPercent !== null && budgetMetrics.utilizationPercent !== undefined && (
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">Spent</span>
                <span className="font-mono font-medium text-slate-700">{budgetMetrics.utilizationPercent}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            to={`/projects/${_id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-600 hover:text-white font-medium text-xs transition-colors border border-slate-200 hover:border-emerald-600"
          >
            <span>View Full Transparency Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
