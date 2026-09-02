import React from 'react';
import { AlertCircle, Calendar, CheckSquare, Clock } from 'lucide-react';

export const StatsOverview = ({ items = [], onFilterSelect }) => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const criticalCount = items.filter(i => i.priority === 'critical').length;

  const upcomingDeadlinesCount = items.filter(i => {
    if (!i.deadline) return false;
    const d = new Date(i.deadline);
    return d >= now && d <= threeDaysFromNow;
  }).length;

  const needsConfirmCount = items.filter(i => i.needsConfirmation).length;

  const inRetentionCount = items.filter(i => i.retention?.status === 'retention').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <button
        onClick={() => onFilterSelect({ priority: 'critical' })}
        className="glass-card text-left p-4 rounded-2xl border border-rose-500/20 hover:border-rose-500/40 hover:bg-slate-900/80 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Critical</span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-110 transition">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-100">{criticalCount}</div>
        <p className="text-[11px] text-slate-400 mt-0.5">Mandatory / High stakes</p>
      </button>

      <button
        onClick={() => onFilterSelect({ dueSoon: true })}
        className="glass-card text-left p-4 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 hover:bg-slate-900/80 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Next 3 Days</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-100">{upcomingDeadlinesCount}</div>
        <p className="text-[11px] text-slate-400 mt-0.5">Upcoming deadlines</p>
      </button>

      <button
        onClick={() => onFilterSelect({ needsConfirmation: true })}
        className="glass-card text-left p-4 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 hover:bg-slate-900/80 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Confirm</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-100">{needsConfirmCount}</div>
        <p className="text-[11px] text-slate-400 mt-0.5">Ambiguous dates/details</p>
      </button>

      <button
        onClick={() => onFilterSelect({ status: 'retention' })}
        className="glass-card text-left p-4 rounded-2xl border border-red-500/20 hover:border-red-500/40 hover:bg-slate-900/80 transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Expiring</span>
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-100">{inRetentionCount}</div>
        <p className="text-[11px] text-slate-400 mt-0.5">Eligible for deletion</p>
      </button>
    </div>
  );
};
