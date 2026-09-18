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
      className={`group relative p-4 rounded-lg border transition-colors cursor-pointer flex flex-col justify-between ${
        item.needsConfirmation
          ? 'border-zinc-700 bg-zinc-950'
          : isRetention
          ? 'border-red-950 bg-red-950/20'
          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
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
          <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
            {item.title}
          </h4>
          {item.subject && (
            <span className="inline-block text-xs text-zinc-400 mt-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              {item.subject}
            </span>
          )}
        </div>

        {/* User Context Caption */}
        {item.originalCaption && (
          <div className="mb-2 text-xs text-zinc-400 italic flex items-center gap-1.5 bg-black px-2.5 py-1.5 rounded border border-zinc-800">
            <MessageSquareQuote className="w-3.5 h-3.5 text-zinc-500 shrink-0 not-italic" />
            <span className="truncate">"{item.originalCaption}"</span>
          </div>
        )}

        {/* Action / Next Step */}
        {item.action && (
          <div className="mb-2.5 p-2 rounded bg-blue-950/40 border border-blue-900/50 text-xs text-blue-200 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium block text-[11px] uppercase tracking-wider text-blue-400">Action:</span>
              <span className="leading-tight">{item.action}</span>
            </div>
          </div>
        )}

        {/* Ambiguity Reason Banner */}
        {item.needsConfirmation && item.confirmationReason && (
          <div className="mb-2.5 p-2 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <span className="leading-tight text-xs">{item.confirmationReason}</span>
          </div>
        )}

        {/* Description Snippet */}
        {item.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-zinc-800 mt-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2.5">
          {item.deadline ? (
            <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-300'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {isOverdue ? 'Passed: ' : 'Due: '}
                {new Date(item.deadline).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
              {item.time && <span className="text-[11px] text-zinc-500">({item.time})</span>}
            </div>
          ) : item.date ? (
            <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(item.date).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </span>
              {item.time && <span className="text-[11px] text-zinc-500">({item.time})</span>}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>No fixed date</span>
            </div>
          )}

          <span className="text-[10px] text-zinc-500 font-mono">
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
                className="px-2 py-1 rounded text-xs font-medium bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800 transition-colors flex items-center gap-1"
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
                className="px-2 py-1 rounded text-xs font-medium bg-blue-800 hover:bg-blue-700 text-white transition-colors"
              >
                Review
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              title="Edit memory"
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Delete memory"
              className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
