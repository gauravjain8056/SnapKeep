import React, { useState } from 'react';
import { AlertTriangle, Clock, RefreshCw, X, Check } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DailyWarningBanner = ({ onRefresh }) => {
  const { dailyWarning, dismissWarning } = useAuth();
  const [keepingId, setKeepingId]   = useState(null);
  const [keptIds, setKeptIds]       = useState(new Set());

  if (!dailyWarning || !dailyWarning.items || dailyWarning.items.length === 0) {
    return null;
  }

  const handleKeep = async (itemId, e) => {
    e.stopPropagation();
    try {
      setKeepingId(itemId);
      await api.post(`/api/items/${itemId}/keep`);
      setKeptIds((prev) => new Set(prev).add(itemId));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to extend retention');
    } finally {
      setKeepingId(null);
    }
  };

  return (
    <div className="rounded-lg bg-zinc-950 border border-red-900/80 p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-red-950/80 text-red-400 border border-red-900 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">Daily Retention Notice</h4>
              <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-300 font-medium border border-red-900">
                {dailyWarning.count} {dailyWarning.count === 1 ? 'item' : 'items'} expiring soon
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              The meaningful dates for these saved items have passed. In accordance with SnapKeep's privacy lifecycle, items are scheduled for automatic deletion unless you choose to KEEP them.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {dailyWarning.items.map((item) => {
                const isKept = keptIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-black border border-zinc-800 text-xs text-zinc-200"
                  >
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-medium truncate max-w-[200px]">{item.title}</span>
                    <button
                      onClick={(e) => handleKeep(item.id, e)}
                      disabled={isKept || keepingId === item.id}
                      className={`ml-1 px-2 py-0.5 rounded text-xs font-medium transition-colors border ${
                        isKept
                          ? 'bg-zinc-900 text-zinc-300 border-zinc-700'
                          : 'bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800'
                      }`}
                    >
                      {isKept ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> Kept (+7d)
                        </span>
                      ) : keepingId === item.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        'KEEP (+7d)'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          onClick={dismissWarning}
          title="Dismiss notice"
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
