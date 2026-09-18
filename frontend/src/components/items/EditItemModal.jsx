import React, { useState } from 'react';
import { Modal } from '../common/Modal';

const inputClass =
  'w-full px-3 py-1.5 bg-black border border-zinc-800 focus:border-blue-600 rounded text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors';

const labelClass = 'block text-xs font-medium text-zinc-400 mb-1';

const selectClass =
  'w-full px-2.5 py-1.5 bg-black border border-zinc-800 focus:border-blue-600 rounded text-xs text-zinc-200 focus:outline-none transition-colors capitalize cursor-pointer';

export const EditItemModal = ({ item, isOpen, onClose, onUpdated }) => {
  if (!item) return null;

  const [formData, setFormData] = useState({
    title:             item.title || '',
    description:       item.description || '',
    category:          item.category || 'other',
    subject:           item.subject || '',
    deadline:          item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
    date:              item.date ? new Date(item.date).toISOString().split('T')[0] : '',
    time:              item.time || '',
    action:            item.action || '',
    priority:          item.priority || 'informational',
    relevance:         item.relevance || '',
    relevanceCategory: item.relevanceCategory || 'general',
    originalCaption:   item.originalCaption || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        deadline: formData.deadline ? new Date(`${formData.deadline}T23:59:59.999Z`) : null,
        date:     formData.date     ? new Date(`${formData.date}T00:00:00.000Z`)     : null,
      };
      await onUpdated(item._id, payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Memory Details" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-2.5 rounded bg-red-950/60 border border-red-900 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className={labelClass}>Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Action Required</label>
          <input type="text" name="action" value={formData.action} onChange={handleChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className={selectClass}>
              {['assignment','exam','payment','registration','event','schedule','scholarship','announcement','opportunity','task','other'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className={selectClass}>
              <option value="critical">Critical</option>
              <option value="important">Important</option>
              <option value="informational">Informational</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Domain</label>
            <select name="relevanceCategory" value={formData.relevanceCategory} onChange={handleChange} className={selectClass}>
              {['academic','financial','personal','opportunity','administrative','general'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className={labelClass}>Subject</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g. CS201" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Deadline Date</label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Time</label>
            <input type="text" name="time" value={formData.time} onChange={handleChange} placeholder="11:59 PM" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description / Summary</label>
          <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className={labelClass}>Personal Relevance</label>
            <input type="text" name="relevance" value={formData.relevance} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Original Caption</label>
            <input type="text" name="originalCaption" value={formData.originalCaption} onChange={handleChange} className={inputClass} />
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
            className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
