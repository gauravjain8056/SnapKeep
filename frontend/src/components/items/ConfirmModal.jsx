import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

const inputClass =
  'w-full px-3 py-2 bg-black/70 border border-purple-900/40 focus:border-purple-500 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition';

const labelClass = 'block text-xs font-semibold text-zinc-400 mb-1';

const selectClass =
  'w-full px-3 py-2 bg-black/70 border border-purple-900/40 focus:border-purple-500 rounded-xl text-xs text-zinc-200 focus:outline-none transition capitalize cursor-pointer';

export const ConfirmModal = ({ item, isOpen, onClose, onConfirmed }) => {
  if (!item) return null;

  const [title, setTitle]                   = useState(item.title || '');
  const [deadline, setDeadline]             = useState(
    item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : ''
  );
  const [date, setDate]                     = useState(
    item.date ? new Date(item.date).toISOString().split('T')[0] : ''
  );
  const [time, setTime]                     = useState(item.time || '');
  const [action, setAction]                 = useState(item.action || '');
  const [category, setCategory]             = useState(item.category || 'other');
  const [priority, setPriority]             = useState(item.priority || 'informational');
  const [relevanceCategory, setRelevanceCategory] = useState(item.relevanceCategory || 'general');
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [error, setError]                   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirmed(item._id, {
        title,
        deadline: deadline ? new Date(`${deadline}T23:59:59.999Z`) : null,
        date:     date     ? new Date(`${date}T00:00:00.000Z`)     : null,
        time,
        action,
        category,
        priority,
        relevanceCategory,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to confirm details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm & Verify Ambiguous Details" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ambiguity Notice */}
        <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/25 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200">AI Ambiguity Notice:</p>
            <p className="mt-0.5 leading-relaxed">
              {item.confirmationReason ||
                'The AI detected relative or uncertain dates in this screenshot. Please set or verify the exact calendar dates below.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/25 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Action Required</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. Submit assignment via portal"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Exact Deadline Date</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Time (Optional)</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 11:59 PM"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
              {['assignment','exam','payment','registration','event','schedule','scholarship','announcement','opportunity','task','other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
              <option value="critical">Critical</option>
              <option value="important">Important</option>
              <option value="informational">Informational</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Domain</label>
            <select value={relevanceCategory} onChange={(e) => setRelevanceCategory(e.target.value)} className={selectClass}>
              {['academic','financial','personal','opportunity','administrative','general'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-purple-900/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-800/30"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle className="w-4 h-4" /> Confirm & Save</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
