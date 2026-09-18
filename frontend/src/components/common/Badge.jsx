import React from 'react';

const categoryStyles = {
  assignment:   'bg-blue-950/60 text-blue-300 border-blue-900/60',
  exam:         'bg-red-950/80 text-red-400 border-red-900/80',
  payment:      'bg-zinc-900 text-zinc-200 border-zinc-800',
  registration: 'bg-zinc-900 text-zinc-200 border-zinc-800',
  event:        'bg-blue-950/40 text-blue-300 border-blue-900/50',
  schedule:     'bg-zinc-900 text-zinc-300 border-zinc-800',
  scholarship:  'bg-blue-950/40 text-blue-300 border-blue-900/50',
  announcement: 'bg-zinc-900 text-zinc-300 border-zinc-800',
  opportunity:  'bg-blue-950/40 text-blue-300 border-blue-900/50',
  task:         'bg-zinc-900 text-zinc-300 border-zinc-800',
  other:        'bg-zinc-900 text-zinc-400 border-zinc-800',
};

const priorityStyles = {
  critical:      'bg-red-950/80 text-red-400 border-red-900 font-medium',
  important:     'bg-blue-950/80 text-blue-300 border-blue-800 font-medium',
  informational: 'bg-zinc-900 text-zinc-400 border-zinc-800',
};

const relevanceStyles = {
  academic:       'bg-blue-950/40 text-blue-300 border-blue-900/40',
  financial:      'bg-zinc-900 text-zinc-300 border-zinc-800',
  personal:       'bg-zinc-900 text-zinc-300 border-zinc-800',
  opportunity:    'bg-blue-950/40 text-blue-300 border-blue-900/40',
  administrative: 'bg-zinc-900 text-zinc-300 border-zinc-800',
  general:        'bg-zinc-900 text-zinc-400 border-zinc-800',
};

export const CategoryBadge = ({ category, className = '' }) => {
  const normalized = (category || 'other').toLowerCase();
  const style = categoryStyles[normalized] || categoryStyles.other;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${style} ${className}`}>
      {normalized}
    </span>
  );
};

export const PriorityBadge = ({ priority, className = '' }) => {
  const normalized = (priority || 'informational').toLowerCase();
  const style = priorityStyles[normalized] || priorityStyles.informational;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border uppercase tracking-wider ${style} ${className}`}>
      {normalized}
    </span>
  );
};

export const RelevanceBadge = ({ domain, className = '' }) => {
  const normalized = (domain || 'general').toLowerCase();
  const style = relevanceStyles[normalized] || relevanceStyles.general;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${style} ${className}`}>
      {normalized}
    </span>
  );
};

export const NeedsConfirmationBadge = ({ reason, className = '' }) => (
  <span
    title={reason || 'This item contains ambiguous fields requiring verification.'}
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-900 text-zinc-200 border border-zinc-700 ${className}`}
  >
    <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    Needs Review
  </span>
);

export const RetentionBadge = ({ expiresAt, extendedCount = 0 }) => {
  const daysLeft = Math.max(0, Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)));
  const isCritical = daysLeft <= 3;
  return (
    <span
      title={`Scheduled for deletion in ${daysLeft} days. Extended ${extendedCount} times.`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
        isCritical
          ? 'bg-red-950/80 text-red-400 border-red-900'
          : 'bg-zinc-900 text-zinc-300 border-zinc-800'
      }`}
    >
      <svg className={`w-3 h-3 ${isCritical ? 'text-red-400' : 'text-zinc-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Expires in {daysLeft}d{extendedCount > 0 ? ` (+${extendedCount * 7}d kept)` : ''}
    </span>
  );
};
