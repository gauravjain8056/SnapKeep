import React, { useState } from 'react';
import { Sparkles, CornerDownLeft } from 'lucide-react';

const SUGGESTED_QUERIES = [
  "What deadlines do I have in the next 3 days?",
  "What did I save about hackathons?",
  "What do I need to do tomorrow?",
  "What payments or fees are due soon?",
  "What assignments are pending?",
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
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-6">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
          <Sparkles className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask SnapKeep anything… (e.g. 'What deadlines do I have this week?')"
          disabled={isLoading}
          className="w-full pl-10 pr-24 py-2 bg-black border border-zinc-800 focus:border-blue-600 rounded text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-800 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5"
        >
          {isLoading ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <CornerDownLeft className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-zinc-500 shrink-0 text-xs">Suggestions:</span>
        {SUGGESTED_QUERIES.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSuggestion(item)}
            className="px-2.5 py-1 rounded bg-black hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 whitespace-nowrap transition-colors text-xs"
          >
            "{item}"
          </button>
        ))}
      </div>
    </div>
  );
};
