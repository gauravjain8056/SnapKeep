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
  'bg-black border border-zinc-800 hover:border-zinc-700 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer';

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
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, subjects, actions..."
            className="w-full pl-9 pr-3 py-1.5 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-blue-600 rounded text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Priority */}
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="important">Important</option>
          <option value="informational">Informational</option>
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
          className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-colors shrink-0 ${
            needsConfirmationOnly
              ? 'bg-blue-950 text-blue-200 border-blue-800'
              : 'bg-black text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          Needs Review
        </button>

        {/* Reset */}
        {hasActiveFilter && (
          <button
            onClick={onReset}
            title="Reset filters"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded transition-colors"
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
              className={`px-2.5 py-1 rounded whitespace-nowrap font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-800 text-white'
                  : 'bg-black text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800'
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
