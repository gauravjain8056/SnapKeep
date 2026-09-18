import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Bookmark,
  Cpu,
  MessageSquareQuote,
  Trash2
} from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  CategoryBadge,
  PriorityBadge,
  RelevanceBadge,
  NeedsConfirmationBadge,
  RetentionBadge
} from '../common/Badge';

export const ItemDetailModal = ({ item, isOpen, onClose, onEdit, onConfirm, onKeep, onDelete }) => {
  if (!item) return null;

  const isRetention = item.retention?.status === 'retention';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Memory Details" maxWidth="max-w-xl">
      <div className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={item.category} />
          <PriorityBadge priority={item.priority} />
          {item.relevanceCategory && <RelevanceBadge domain={item.relevanceCategory} />}
          {item.needsConfirmation && <NeedsConfirmationBadge reason={item.confirmationReason} />}
          {isRetention && item.retention?.expiresAt && (
            <RetentionBadge expiresAt={item.retention.expiresAt} extendedCount={item.retention.extendedCount} />
          )}
        </div>

        {/* Title & Subject */}
        <div>
          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
          {item.subject && (
            <span className="inline-flex items-center gap-1 text-xs text-zinc-400 mt-1 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              <BookOpen className="w-3 h-3" /> {item.subject}
            </span>
          )}
        </div>

        {/* Original Caption */}
        {item.originalCaption && (
          <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
            <MessageSquareQuote className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-xs text-zinc-400 block">
                User Provided Context:
              </span>
              <p className="mt-0.5 italic text-zinc-200">"{item.originalCaption}"</p>
            </div>
          </div>
        )}

        {/* Action */}
        {item.action && (
          <div className="p-3 rounded bg-blue-950/40 border border-blue-900/50 text-xs text-blue-200 flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium block uppercase tracking-wider text-blue-400 text-[10px]">
                Recommended Action
              </span>
              <p className="mt-0.5 text-sm font-medium">{item.action}</p>
            </div>
          </div>
        )}

        {/* Ambiguity Warning */}
        {item.needsConfirmation && item.confirmationReason && (
          <div className="p-3 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium block uppercase tracking-wider text-zinc-400 text-[10px]">
                Ambiguity Review
              </span>
              <p className="mt-0.5">{item.confirmationReason}</p>
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded bg-black border border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-500 block">Deadline:</span>
            <span className="text-zinc-200 font-medium">
              {item.deadline
                ? new Date(item.deadline).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                  })
                : 'None set'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Time:</span>
            <span className="text-zinc-200 font-medium">{item.time || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block">AI Confidence:</span>
            <span className="text-blue-400 font-medium font-mono">
              {Math.round((item.confidence || 0) * 100)}%
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block">Source Type:</span>
            <span className="text-zinc-200 capitalize font-medium">
              {item.sourceType || 'Screenshot (discarded)'}
            </span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Extracted Summary
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 bg-black p-3 rounded border border-zinc-800 leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {/* Personal Relevance */}
        {item.relevance && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Personal Relevance
            </h4>
            <p className="text-xs text-zinc-400 bg-black p-3 rounded border border-zinc-800">
              {item.relevance}
            </p>
          </div>
        )}

        {/* Processing Meta */}
        {item.processing && (
          <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono pt-2 border-t border-zinc-800">
            <Cpu className="w-3.5 h-3.5 text-zinc-500" />
            <span>Model: {item.processing.aiModel || 'Gemini Vision'}</span>
            <span>•</span>
            <span>
              Processed:{' '}
              {item.processing.processedAt
                ? new Date(item.processing.processedAt).toLocaleTimeString()
                : 'Recent'}
            </span>
          </div>
        )}

        {/* Retention Banner */}
        {isRetention && (
          <div className="p-3 rounded bg-red-950/40 border border-red-900 text-xs text-red-300 flex items-center justify-between">
            <div>
              <span className="font-semibold block">Retention Mode Active</span>
              <span>
                Expires:{' '}
                {item.retention?.expiresAt
                  ? new Date(item.retention.expiresAt).toLocaleDateString()
                  : 'Soon'}
              </span>
            </div>
            <button
              onClick={() => { onKeep(item._id); onClose(); }}
              className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800 font-medium rounded transition-colors"
            >
              KEEP (+7d)
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <span className="text-xs text-zinc-500 font-mono">
            Captured: {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${item.title}"?`)) onDelete(item._id);
                }}
                className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 text-xs font-medium rounded border border-red-900 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            {item.needsConfirmation && (
              <button
                onClick={() => { onClose(); onConfirm(item); }}
                className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                Review Ambiguous Details
              </button>
            )}
            <button
              onClick={() => { onClose(); onEdit(item); }}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium rounded border border-zinc-700 transition-colors"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
