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
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl border border-purple-900/30 my-6">
      <div className="w-14 h-14 rounded-2xl bg-purple-700/15 border border-purple-700/30 flex items-center justify-center text-purple-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-lg font-bold text-white mb-1">{title}</h4>
      <p className="text-sm text-zinc-500 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-purple-800/30"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
