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
    <div className="mb-10 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={onClearSearch}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white px-3 py-1.5 rounded-xl bg-black border border-purple-900/30 hover:border-purple-700/40 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          {fromCache && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/8 text-emerald-400 border border-emerald-500/20 font-mono">
              ⚡ Cached
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-purple-700/10 text-purple-400 border border-purple-700/20 font-mono">
            {intent?.searchType === 'structured' ? 'Structured Filter' : 'Keyword Search'}
          </span>
        </div>
      </div>

      {/* AI Answer Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/30 via-black/90 to-black border border-purple-700/30 shadow-2xl relative overflow-hidden purple-glow">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-purple-700/15 border border-purple-700/30 text-purple-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">SnapKeep AI Answer</span>
              <span className="text-xs text-zinc-600 font-mono">for "{query}"</span>
            </div>
            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal whitespace-pre-line">
              {answer}
            </p>

            {intent && (
              <div className="mt-4 pt-3 border-t border-purple-900/30 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                <span className="text-zinc-600 font-mono">Intent:</span>
                <span className="px-2 py-0.5 rounded-md bg-white/4 border border-purple-900/30 font-semibold capitalize text-zinc-300">
                  {intent.searchType} search
                </span>
                {intent.category && (
                  <span className="px-2 py-0.5 rounded-md bg-white/4 border border-purple-900/30 capitalize text-zinc-300">
                    Category: {intent.category}
                  </span>
                )}
                {intent.dateRangeType && intent.dateRangeType !== 'none' && (
                  <span className="px-2 py-0.5 rounded-md bg-white/4 border border-purple-900/30 text-zinc-300">
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Retrieved Saved Items ({items.length})
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
