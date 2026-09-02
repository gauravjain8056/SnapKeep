import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';

const SUGGESTED_QUERIES = [
  "What deadlines do I have in the next 3 days?",
  "What did I save about hackathons?",
  "What do I need to do tomorrow?",
  "What payments or fees are due soon?",
  "What assignments are pending?"
];

export const NaturalSearchBox = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleSelectSuggestion = (suggested) => {
    setQuery(suggested);
    onSearch(suggested);
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 via-slate-900/60 to-slate-950 shadow-2xl mb-8">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask SnapKeep anything... (e.g. 'What deadlines do I have this week?')"
          disabled={isLoading}
          className="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 border border-slate-700/60 focus:border-indigo-500 rounded-2xl text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition shadow-inner"
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask AI</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-500 shrink-0 font-medium text-[11px]">Try asking:</span>
        {SUGGESTED_QUERIES.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSuggestion(item)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-indigo-950/40 text-slate-400 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/30 whitespace-nowrap transition text-[11px]"
          >
            "{item}"
          </button>
        ))}
      </div>
    </div>
  );
};
