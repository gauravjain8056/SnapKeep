import React from 'react';
import { Sparkles } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'Try adjusting your filters or upload a screenshot to capture your first memory.',
  actionLabel = '',
  onAction = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-zinc-950 rounded-lg border border-zinc-800 my-6">
      <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-zinc-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
