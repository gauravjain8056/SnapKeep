import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  RefreshCw,
  Bookmark,
  MessageSquareQuote
} from 'lucide-react';
import { CategoryBadge, PriorityBadge, RelevanceBadge, NeedsConfirmationBadge, RetentionBadge } from '../common/Badge';

export const ItemCard = React.memo(({ item, onEdit, onConfirm, onKeep, onDelete, onViewDetails }) => {
  const [isKeeping, setIsKeeping]   = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleKeep = async (e) => {
    e.stopPropagation();
    try {
      setIsKeeping(true);
      await onKeep(item._id);
    } finally {
      setIsKeeping(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete memory "${item.title}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(item._id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const isOverdue   = item.deadline && new Date(item.deadline) < new Date();
  const isRetention = item.retention?.status === 'retention';

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(item)}
      className={`group relative glass-card p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        item.needsConfirmation
          ? 'border-amber-500/30 bg-amber-950/10'
          : isRetention
          ? 'border-red-500/25 bg-red-950/10'
          : 'border-purple-900/20 hover:border-purple-700/40'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <CategoryBadge category={item.category} />
          <PriorityBadge priority={item.priority} />
          {item.relevanceCategory && item.relevanceCategory !== 'general' && (
            <RelevanceBadge domain={item.relevanceCategory} />
          )}
          {item.needsConfirmation && (
            <NeedsConfirmationBadge reason={item.confirmationReason} />
          )}
          {isRetention && item.retention.expiresAt && (
            <RetentionBadge
              expiresAt={item.retention.expiresAt}
              extendedCount={item.retention.extendedCount}
            />
          )}
        </div>

        {/* Title & Subject */}
        <div className="mb-2">
          <h4 className="text-base font-bold text-zinc-100 group-hover:text-purple-300 transition leading-snug line-clamp-2">
            {item.title}
          </h4>
          {item.subject && (
            <span className="inline-block text-xs font-semibold text-zinc-500 mt-1 bg-white/5 px-2 py-0.5 rounded-md">
              📚 {item.subject}
            </span>
          )}
        </div>

        {/* User Context Caption */}
        {item.originalCaption && (
          <div className="mb-2.5 text-[11px] text-zinc-500 italic flex items-center gap-1.5 bg-white/3 px-2.5 py-1.5 rounded-lg border border-purple-900/20">
            <MessageSquareQuote className="w-3.5 h-3.5 text-purple-700 shrink-0 not-italic" />
            <span className="truncate">"{item.originalCaption}"</span>
          </div>
        )}

        {/* Action / Next Step */}
        {item.action && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-purple-700/8 border border-purple-700/20 text-xs text-purple-300 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-[11px] uppercase tracking-wider text-purple-500">Action:</span>
              <span className="leading-tight">{item.action}</span>
            </div>
          </div>
        )}

        {/* Ambiguity Reason Banner */}
        {item.needsConfirmation && item.confirmationReason && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-tight text-[11px]">{item.confirmationReason}</span>
          </div>
        )}

        {/* Description Snippet */}
        {item.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-purple-900/20 mt-2">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
          {item.deadline ? (
            <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-300'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {isOverdue ? 'Passed: ' : 'Due: '}
                {new Date(item.deadline).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
              {item.time && <span className="text-[11px] text-zinc-600">({item.time})</span>}
            </div>
          ) : item.date ? (
            <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
              {item.time && <span className="text-[11px] text-zinc-600">({item.time})</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-600 text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>No fixed date</span>
            </div>
          )}

          <span className="text-[10px] text-zinc-700 font-mono">
            {Math.round((item.confidence || 1) * 100)}% conf
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isRetention && (
              <button
                onClick={handleKeep}
                disabled={isKeeping}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 transition flex items-center gap-1"
              >
                {isKeeping ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <><Bookmark className="w-3 h-3" /> KEEP (+7d)</>
                )}
              </button>
            )}

            {item.needsConfirmation && (
              <button
                onClick={(e) => { e.stopPropagation(); onConfirm(item); }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-700 hover:bg-purple-600 text-white transition shadow-sm"
              >
                Confirm Details
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              title="Edit memory"
              className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete memory"
              className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
