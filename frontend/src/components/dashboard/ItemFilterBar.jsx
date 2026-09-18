import React from 'react';
import { Search, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

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

const RELEVANCE_CATEGORIES = [
  { id: 'all', label: 'All Domains' },
  { id: 'academic', label: 'Academic' },
  { id: 'financial', label: 'Financial' },
  { id: 'personal', label: 'Personal' },
  { id: 'opportunity', label: 'Opportunity' },
  { id: 'administrative', label: 'Administrative' },
  { id: 'general', label: 'General' },
];

const SORT_OPTIONS = [
  { id: 'createdAt', label: 'Date Saved' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'priority', label: 'Priority' },
];

const selectClass =
  'bg-black border border-zinc-800 hover:border-zinc-700 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none cursor-pointer transition-colors';

const toggleClass = (active) =>
  `px-2.5 py-1.5 rounded text-xs font-medium border transition-colors shrink-0 ${
    active
      ? 'bg-blue-950 text-blue-200 border-blue-800'
      : 'bg-black text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900'
  }`;

export const ItemFilterBar = ({
  search, setSearch,
  category, setCategory,
  priority, setPriority,
  status, setStatus,
  relevanceCategory, setRelevanceCategory,
  needsConfirmationOnly, setNeedsConfirmationOnly,
  dueSoonOnly, setDueSoonOnly,
  sortBy, setSortBy,
  order, setOrder,
  onReset,
}) => {
  const hasActiveFilter =
    search ||
    category !== 'all' ||
    priority !== 'all' ||
    status !== 'all' ||
    relevanceCategory !== 'all' ||
    needsConfirmationOnly ||
    dueSoonOnly ||
    sortBy !== 'createdAt';

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 mb-6 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles, subjects, actions..."
            className="w-full pl-9 pr-3 py-1.5 bg-black border border-zinc-800 hover:border-zinc-700 focus:border-blue-600 rounded text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-colors"
          />
        </div>

        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="important">Important</option>
          <option value="informational">Informational</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="retention">Expiring</option>
        </select>

        <select value={relevanceCategory} onChange={(e) => setRelevanceCategory(e.target.value)} className={selectClass}>
          {RELEVANCE_CATEGORIES.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setDueSoonOnly(!dueSoonOnly)} className={toggleClass(dueSoonOnly)}>
            Due Soon
          </button>
          <button onClick={() => setNeedsConfirmationOnly(!needsConfirmationOnly)} className={toggleClass(needsConfirmationOnly)}>
            Needs Review
          </button>
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
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
        <span className="shrink-0">Sort by</span>
        <div className="flex items-center gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`px-2.5 py-1 rounded border transition-colors font-medium ${
                sortBy === opt.id
                  ? 'bg-zinc-800 text-zinc-200 border-zinc-600'
                  : 'bg-black text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}
          title={order === 'desc' ? 'Descending — click for ascending' : 'Ascending — click for descending'}
          className="ml-1 flex items-center gap-1 px-2 py-1 rounded border border-zinc-800 bg-black text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
        >
          {order === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
          <span>{order === 'desc' ? 'Desc' : 'Asc'}</span>
        </button>
      </div>

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

