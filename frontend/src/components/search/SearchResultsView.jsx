import React from 'react';
import { Sparkles, ArrowLeft, Database, Bot, Zap } from 'lucide-react';
import { ItemCard } from '../dashboard/ItemCard';
import { EmptyState } from '../common/EmptyState';

export const SearchResultsView = ({
  searchResult,
  onClearSearch,
  onEdit,
  onConfirm,
  onKeep,
  onDelete,
  onViewDetails
}) => {
  if (!searchResult) return null;

  const { query, answer, items = [], intent, fromCache } = searchResult;

  return (
    <div className="mb-10 space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <button
          onClick={onClearSearch}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {fromCache && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              ⚡ Cached in Redis
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            {intent?.searchType === 'structured' ? 'Structured Filter' : 'Keyword Search'}
          </span>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">SnapKeep AI Answer</span>
              <span className="text-xs text-slate-400 font-mono">for "{query}"</span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal whitespace-pre-line">
              {answer}
            </p>

            {intent && (
              <div className="mt-4 pt-3 border-t border-indigo-500/20 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="text-slate-500 font-mono">Intent:</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-semibold capitalize text-slate-300">
                  {intent.searchType} search
                </span>
                {intent.category && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 capitalize text-slate-300">
                    Category: {intent.category}
                  </span>
                )}
                {intent.dateRangeType && intent.dateRangeType !== 'none' && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
                    Range: {intent.dateRangeType.replace('_', ' ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
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
