import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All' },
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
  { id: 'other', label: 'Other' },
];

const selectClass =
  'bg-black/70 border border-purple-900/40 hover:border-purple-700/50 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-medium text-zinc-300 focus:outline-none transition cursor-pointer';

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
  onReset,
}) => {
  const hasActiveFilter =
    search || category !== 'all' || priority !== 'all' || status !== 'all' || needsConfirmationOnly;

  return (
    <div className="glass-panel p-4 rounded-2xl border border-purple-900/30 mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-purple-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, subjects, actions..."
            className="w-full pl-9 pr-4 py-2 bg-black/70 border border-purple-900/40 hover:border-purple-700/50 focus:border-purple-500 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/40 transition"
          />
        </div>

        {/* Priority */}
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
          <option value="all">All Priorities</option>
          <option value="critical">🔴 Critical</option>
          <option value="important">🟡 Important</option>
          <option value="informational">🔵 Informational</option>
        </select>

        {/* Status */}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="retention">Expiring</option>
        </select>

        {/* Needs Confirmation Toggle */}
        <button
          onClick={() => setNeedsConfirmationOnly(!needsConfirmationOnly)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
            needsConfirmationOnly
              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              : 'bg-black/50 text-zinc-500 border-purple-900/30 hover:text-zinc-200 hover:border-purple-700/40'
          }`}
        >
          ⚠️ Needs Confirm
        </button>

        {/* Reset */}
        {hasActiveFilter && (
          <button
            onClick={onReset}
            title="Reset filters"
            className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition ${
                isSelected
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                  : 'bg-black/40 text-zinc-500 hover:text-zinc-200 hover:bg-purple-900/20 border border-purple-900/20 hover:border-purple-700/30'
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
