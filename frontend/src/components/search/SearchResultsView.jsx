import React from 'react';
import { ArrowLeft, Bot } from 'lucide-react';
import { ItemCard } from '../dashboard/ItemCard';
import { EmptyState } from '../common/EmptyState';

export const SearchResultsView = ({
  searchResult,
  onClearSearch,
  onEdit,
  onConfirm,
  onKeep,
  onDelete,
  onViewDetails,
}) => {
  if (!searchResult) return null;

  const { query, answer, items = [], intent, fromCache } = searchResult;

  return (
    <div className="mb-10 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onClearSearch}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded bg-black border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          {fromCache && (
            <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono">
              Cached
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900 font-mono">
            {intent?.searchType === 'structured' ? 'Structured Filter' : 'Keyword Search'}
          </span>
        </div>
      </div>

      {/* AI Answer Box */}
      <div className="p-5 rounded-lg bg-zinc-950 border border-blue-900/60 relative">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded bg-blue-950 text-blue-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Summary Answer</span>
              <span className="text-xs text-zinc-400">for "{query}"</span>
            </div>
            <p className="text-sm text-zinc-200 leading-relaxed font-normal whitespace-pre-line">
              {answer}
            </p>

            {intent && (
              <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="text-zinc-500">Query intent:</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 capitalize text-zinc-300">
                  {intent.searchType} search
                </span>
                {intent.category && (
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 capitalize text-zinc-300">
                    Category: {intent.category}
                  </span>
                )}
                {intent.dateRangeType && intent.dateRangeType !== 'none' && (
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    Range: {intent.dateRangeType.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Matching Items ({items.length})
          </h3>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onEdit={onEdit}
                onConfirm={onConfirm}
                onKeep={onKeep}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No direct matching items found"
            description="SnapKeep couldn't find any specific saved items matching this query in your account."
          />
        )}
      </div>
    </div>
  );
};
