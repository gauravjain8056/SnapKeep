import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Bookmark,
  Cpu,
  MessageSquareQuote
} from 'lucide-react';
import { Modal } from '../common/Modal';
import {
  CategoryBadge,
  PriorityBadge,
  RelevanceBadge,
  NeedsConfirmationBadge,
  RetentionBadge
} from '../common/Badge';

export const ItemDetailModal = ({ item, isOpen, onClose, onEdit, onConfirm, onKeep }) => {
  if (!item) return null;

  const isRetention = item.retention?.status === 'retention';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Memory Deep Dive" maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
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
          <h3 className="text-xl font-bold text-white">{item.title}</h3>
          {item.subject && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-300 mt-1 bg-purple-700/10 border border-purple-700/20 px-2.5 py-0.5 rounded-lg">
              <BookOpen className="w-3 h-3" /> {item.subject}
            </span>
          )}
        </div>

        {/* Original Caption */}
        {item.originalCaption && (
          <div className="p-3 rounded-xl bg-white/3 border border-purple-900/25 text-xs text-zinc-300 flex items-start gap-2.5">
            <MessageSquareQuote className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[10px] uppercase tracking-wider text-purple-400 block">
                User Provided Context:
              </span>
              <p className="mt-0.5 italic text-zinc-200">"{item.originalCaption}"</p>
            </div>
          </div>
        )}

        {/* Action */}
        {item.action && (
          <div className="p-3.5 rounded-2xl bg-purple-700/8 border border-purple-700/20 text-xs text-purple-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-purple-400 text-[10px]">
                Recommended Action
              </span>
              <p className="mt-0.5 text-sm font-medium">{item.action}</p>
            </div>
          </div>
        )}

        {/* Ambiguity Warning */}
        {item.needsConfirmation && item.confirmationReason && (
          <div className="p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-amber-400 text-[10px]">
                Ambiguity Warning
              </span>
              <p className="mt-0.5">{item.confirmationReason}</p>
            </div>
          </div>
        )}

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/3 border border-purple-900/20 text-xs">
          <div>
            <span className="text-zinc-500 block font-medium">Deadline:</span>
            <span className="text-zinc-200 font-semibold">
              {item.deadline
                ? new Date(item.deadline).toLocaleDateString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                  })
                : 'None set'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block font-medium">Time:</span>
            <span className="text-zinc-200 font-semibold">{item.time || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block font-medium">AI Confidence:</span>
            <span className="text-purple-400 font-semibold font-mono">
              {Math.round((item.confidence || 0) * 100)}%
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block font-medium">Source Type:</span>
            <span className="text-zinc-200 capitalize font-medium">
              {item.sourceType || 'Screenshot (discarded)'}
            </span>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Extracted Summary
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 bg-black/50 p-3.5 rounded-xl border border-purple-900/20 leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {/* Personal Relevance */}
        {item.relevance && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Personal Relevance Explanation
            </h4>
            <p className="text-xs text-zinc-400 bg-black/50 p-3 rounded-xl border border-purple-900/20">
              {item.relevance}
            </p>
          </div>
        )}

        {/* Processing Meta */}
        {item.processing && (
          <div className="flex items-center gap-3 text-[11px] text-zinc-600 font-mono pt-2 border-t border-purple-900/20">
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
          <div className="p-3 rounded-xl bg-red-950/25 border border-red-500/20 text-xs text-red-300 flex items-center justify-between">
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
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition"
            >
              KEEP (+7d)
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-purple-900/20">
          <span className="text-[11px] text-zinc-600 font-mono">
            Captured: {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            {item.needsConfirmation && (
              <button
                onClick={() => { onClose(); onConfirm(item); }}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-xl transition"
              >
                Confirm Ambiguous Details
              </button>
            )}
            <button
              onClick={() => { onClose(); onEdit(item); }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold rounded-xl border border-purple-900/30 transition"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
