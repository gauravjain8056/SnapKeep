import React, { useState } from 'react';
import { Modal } from '../common/Modal';

export const EditItemModal = ({ item, isOpen, onClose, onUpdated }) => {
  if (!item) return null;

  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    category: item.category || 'other',
    subject: item.subject || '',
    deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
    date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
    time: item.time || '',
    action: item.action || '',
    priority: item.priority || 'informational',
    relevance: item.relevance || '',
    relevanceCategory: item.relevanceCategory || 'general',
    originalCaption: item.originalCaption || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        deadline: formData.deadline ? new Date(`${formData.deadline}T23:59:59.999Z`) : null,
        date: formData.date ? new Date(`${formData.date}T00:00:00.000Z`) : null
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-slate-100 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Action Required</label>
          <input
            type="text"
            name="action"
            value={formData.action}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-slate-100 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
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
              name="priority"
              value={formData.priority}
              onChange={handleChange}
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
              name="relevanceCategory"
              value={formData.relevanceCategory}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none capitalize"
            >
              {['academic', 'financial', 'personal', 'opportunity', 'administrative', 'general'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. CS201"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline Date</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
            <input
              type="text"
              name="time"
              value={formData.time}
              onChange={handleChange}
              placeholder="11:59 PM"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Summary</label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Relevance</label>
            <input
              type="text"
              name="relevance"
              value={formData.relevance}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Original User Context / Caption</label>
            <input
              type="text"
              name="originalCaption"
              value={formData.originalCaption}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 focus:border-blue-500 rounded-xl text-xs text-slate-100 focus:outline-none"
            />
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
