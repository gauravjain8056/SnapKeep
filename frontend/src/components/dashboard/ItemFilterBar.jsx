import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'assignment', label: 'Assignments' },
  { id: 'exam', label: 'Exams' },
  { id: 'payment', label: 'Payments' },
  { id: 'registration', label: 'Registrations' },
  { id: 'event', label: 'Events' },
  { id: 'schedule', label: 'Schedules' },
  { id: 'scholarship', label: 'Scholarships' },
  { id: 'opportunity', label: 'Opportunities' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'task', label: 'Tasks' },
  { id: 'other', label: 'Other' }
];

export const ItemFilterBar = ({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
  status,
  setStatus,
  needsConfirmationOnly,
  setNeedsConfirmationOnly,
  onReset
}) => {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved titles, subjects, actions..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 focus:border-blue-500 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-slate-900/90 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="critical">🔴 Critical</option>
          <option value="important">🟡 Important</option>
          <option value="informational">🔵 Informational</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-900/90 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Memories</option>
          <option value="retention">In Retention (Expiring)</option>
        </select>

        {/* Needs Confirmation Toggle */}
        <button
          onClick={() => setNeedsConfirmationOnly(!needsConfirmationOnly)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
            needsConfirmationOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          ⚠️ Needs Confirm
        </button>

        {/* Reset button */}
        {(search || category !== 'all' || priority !== 'all' || status !== 'all' || needsConfirmationOnly) && (
          <button
            onClick={onReset}
            title="Reset filters"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
