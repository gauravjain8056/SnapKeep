import React, { useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';

export const ConfirmModal = ({ item, isOpen, onClose, onConfirmed }) => {
  if (!item) return null;

  const [title, setTitle] = useState(item.title || '');
  const [deadline, setDeadline] = useState(
    item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : ''
  );
  const [date, setDate] = useState(
    item.date ? new Date(item.date).toISOString().split('T')[0] : ''
  );
  const [time, setTime] = useState(item.time || '');
  const [action, setAction] = useState(item.action || '');
  const [category, setCategory] = useState(item.category || 'other');
  const [priority, setPriority] = useState(item.priority || 'informational');
  const [relevanceCategory, setRelevanceCategory] = useState(item.relevanceCategory || 'general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onConfirmed(item._id, {
        title,
        deadline: deadline ? new Date(`${deadline}T23:59:59.999Z`) : null,
        date: date ? new Date(`${date}T00:00:00.000Z`) : null,
        time,
        action,
        category,
        priority,
        relevanceCategory
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
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200">AI Ambiguity Notice:</p>
            <p className="mt-0.5 leading-relaxed">
              {item.confirmationReason || 'The AI detected relative or uncertain dates in this screenshot. Please set or verify the exact calendar dates below.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-slate-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Action Required</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. Submit assignment via portal"
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-slate-100 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Exact Deadline Date
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Time (Optional)
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 11:59 PM"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none capitalize"
            >
              {[
                'assignment', 'exam', 'payment', 'registration', 'event',
                'schedule', 'scholarship', 'announcement', 'opportunity', 'task', 'other'
              ].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none capitalize"
            >
              <option value="critical">Critical</option>
              <option value="important">Important</option>
              <option value="informational">Informational</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
            <select
              value={relevanceCategory}
              onChange={(e) => setRelevanceCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none capitalize"
            >
              {['academic', 'financial', 'personal', 'opportunity', 'administrative', 'general'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Confirm & Save
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
