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
import { CategoryBadge, PriorityBadge, RelevanceBadge, NeedsConfirmationBadge, RetentionBadge } from '../common/Badge';

export const ItemDetailModal = ({ item, isOpen, onClose, onEdit, onConfirm, onKeep }) => {
  if (!item) return null;

  const isRetention = item.retention?.status === 'retention';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Memory Deep Dive" maxWidth="max-w-xl">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={item.category} />
          <PriorityBadge priority={item.priority} />
          {item.relevanceCategory && (
            <RelevanceBadge domain={item.relevanceCategory} />
          )}
          {item.needsConfirmation && (
            <NeedsConfirmationBadge reason={item.confirmationReason} />
          )}
          {isRetention && item.retention?.expiresAt && (
            <RetentionBadge
              expiresAt={item.retention.expiresAt}
              extendedCount={item.retention.extendedCount}
            />
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-100">{item.title}</h3>
          {item.subject && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 mt-1 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
              <BookOpen className="w-3 h-3" /> {item.subject}
            </span>
          )}
        </div>

        {item.originalCaption && (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2.5">
            <MessageSquareQuote className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-300 block">
                User Provided Context:
              </span>
              <p className="mt-0.5 italic text-slate-200">"{item.originalCaption}"</p>
            </div>
          </div>
        )}

        {item.action && (
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-blue-400 text-[10px]">
                Recommended Action
              </span>
              <p className="mt-0.5 text-sm font-medium">{item.action}</p>
            </div>
          </div>
        )}

        {item.needsConfirmation && item.confirmationReason && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-amber-400 text-[10px]">
                Ambiguity Warning
              </span>
              <p className="mt-0.5">{item.confirmationReason}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Deadline:</span>
            <span className="text-slate-200 font-semibold">
              {item.deadline
                ? new Date(item.deadline).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })
                : 'None set'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Time:</span>
            <span className="text-slate-200 font-semibold">{item.time || 'Not specified'}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">AI Confidence:</span>
            <span className="text-emerald-400 font-semibold font-mono">
              {Math.round((item.confidence || 0) * 100)}%
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Source Type:</span>
            <span className="text-slate-200 capitalize font-medium">{item.sourceType || 'Screenshot (discarded)'}</span>
          </div>
        </div>

        {item.description && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Extracted Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {item.relevance && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Personal Relevance Explanation
            </h4>
            <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {item.relevance}
            </p>
          </div>
        )}

        {item.processing && (
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/60">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Model: {item.processing.aiModel || 'Gemini Vision'}</span>
            <span>•</span>
            <span>Processed: {item.processing.processedAt ? new Date(item.processing.processedAt).toLocaleTimeString() : 'Recent'}</span>
          </div>
        )}

        {isRetention && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center justify-between">
            <div>
              <span className="font-semibold block">Retention Mode Active</span>
              <span>Expires: {item.retention?.expiresAt ? new Date(item.retention.expiresAt).toLocaleDateString() : 'Soon'}</span>
            </div>
            <button
              onClick={() => {
                onKeep(item._id);
                onClose();
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
            >
              KEEP (+7d)
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 font-mono">
            Captured: {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            {item.needsConfirmation && (
              <button
                onClick={() => {
                  onClose();
                  onConfirm(item);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
              >
                Confirm Ambiguous Details
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onEdit(item);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
