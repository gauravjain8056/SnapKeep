import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

const inputClass =
  'w-full px-3 py-1.5 bg-black border border-zinc-800 focus:border-blue-600 rounded text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors';

const labelClass = 'block text-xs font-medium text-zinc-400 mb-1';

const selectClass =
  'w-full px-2.5 py-1.5 bg-black border border-zinc-800 focus:border-blue-600 rounded text-xs text-zinc-200 focus:outline-none transition-colors capitalize cursor-pointer';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Review & Confirm Details" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Ambiguity Notice */}
        <div className="p-3 rounded bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-zinc-200">Date Verification Needed:</p>
            <p className="mt-0.5 leading-relaxed text-zinc-400">
              {item.confirmationReason ||
                'Relative or uncertain dates were detected in this screenshot. Please set or verify the exact calendar dates below.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded bg-red-950/60 border border-red-900 text-red-300 text-xs">
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

        <div className="grid grid-cols-2 gap-2.5">
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

        <div className="grid grid-cols-3 gap-2.5">
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

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle className="w-4 h-4" /> Save Details</>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
