import React, { useState } from 'react';
import { AlertTriangle, Clock, RefreshCw, X, Check } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DailyWarningBanner = ({ onRefresh }) => {
  const { dailyWarning, dismissWarning } = useAuth();
  const [keepingId, setKeepingId] = useState(null);
  const [keptIds, setKeptIds] = useState(new Set());

  if (!dailyWarning || !dailyWarning.items || dailyWarning.items.length === 0) {
    return null;
  }

  const handleKeep = async (itemId, e) => {
    e.stopPropagation();
    try {
      setKeepingId(itemId);
      await api.post(`/api/items/${itemId}/keep`);
      setKeptIds(prev => new Set(prev).add(itemId));
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to extend retention');
    } finally {
      setKeepingId(null);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-red-950/30 to-slate-900 border border-amber-500/30 p-5 mb-6 shadow-xl animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-amber-200">
                Daily Retention Notice
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                {dailyWarning.count} {dailyWarning.count === 1 ? 'item' : 'items'} expiring soon
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              The meaningful dates for these saved items have passed. In accordance with SnapKeep's privacy lifecycle, items are scheduled for automatic deletion unless you choose to KEEP them.
            </p>

            {/* List of items nearing deletion */}
            <div className="mt-3.5 flex flex-wrap gap-2">
              {dailyWarning.items.map((item) => {
                const isKept = keptIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-200"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-medium truncate max-w-[200px]">{item.title}</span>
                    <button
                      onClick={(e) => handleKeep(item.id, e)}
                      disabled={isKept || keepingId === item.id}
                      className={`ml-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                        isKept
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
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

        {/* Close Button */}
        <button
          onClick={dismissWarning}
          title="Dismiss notice"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
