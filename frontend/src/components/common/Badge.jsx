import React from 'react';

const categoryStyles = {
  assignment: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  exam: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  payment: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  registration: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  event: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  schedule: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  scholarship: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  announcement: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  opportunity: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  task: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
};

const priorityStyles = {
  critical: 'bg-rose-600/15 text-rose-300 border-rose-500/30 font-semibold',
  important: 'bg-amber-600/15 text-amber-300 border-amber-500/30',
  informational: 'bg-slate-600/15 text-slate-300 border-slate-500/30'
};

const relevanceStyles = {
  academic: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  financial: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  personal: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  opportunity: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  administrative: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
  general: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
};

export const CategoryBadge = ({ category, className = '' }) => {
  const normalized = (category || 'other').toLowerCase();
  const style = categoryStyles[normalized] || categoryStyles.other;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${style} ${className}`}>
      {normalized}
    </span>
  );
};

export const PriorityBadge = ({ priority, className = '' }) => {
  const normalized = (priority || 'informational').toLowerCase();
  const style = priorityStyles[normalized] || priorityStyles.informational;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border uppercase tracking-wider ${style} ${className}`}>
      {normalized}
    </span>
  );
};

export const RelevanceBadge = ({ domain, className = '' }) => {
  const normalized = (domain || 'general').toLowerCase();
  const style = relevanceStyles[normalized] || relevanceStyles.general;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize ${style} ${className}`}>
      📌 {normalized}
    </span>
  );
};

export const NeedsConfirmationBadge = ({ reason, className = '' }) => (
  <span
    title={reason || 'This item contains ambiguous fields requiring verification.'}
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse ${className}`}
  >
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    Needs Confirmation
  </span>
);

export const RetentionBadge = ({ expiresAt, extendedCount = 0 }) => {
  const daysLeft = Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));
  return (
    <span
      title={`Scheduled for deletion in ${daysLeft} days. Extended ${extendedCount} times.`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-300 border border-red-500/30"
    >
      <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Expires in {daysLeft}d {extendedCount > 0 ? `(+${extendedCount * 7}d kept)` : ''}
    </span>
  );
};
