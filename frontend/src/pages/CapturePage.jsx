import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, AlertCircle, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { ItemCard } from '../components/dashboard/ItemCard';
import { ConfirmModal } from '../components/items/ConfirmModal';
import { EditItemModal } from '../components/items/EditItemModal';

export const CapturePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);
  const [error, setError] = useState('');
  const [confirmingItem, setConfirmingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WEBP).');
        return;
      }
      setError('');
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setError('');
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setError('Please upload or select a screenshot first.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption);

      const res = await api.post('/api/items/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && (res.data?.data?.items || res.data?.data?.item)) {
        const items = res.data.data.items || [res.data.data.item];
        setExtractedItems(items);
        const firstUnconfirmed = items.find((i) => i.needsConfirmation);
        if (firstUnconfirmed) {
          setConfirmingItem(firstUnconfirmed);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to process screenshot.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setExtractedItems([]);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmedItem = async (id, data) => {
    const res = await api.post(`/api/items/${id}/confirm`, data);
    if (res.data?.success && res.data?.data?.item) {
      setExtractedItems((prev) =>
        prev.map((item) => (item._id === id ? res.data.data.item : item))
      );
    }
  };

  const handleUpdatedItem = async (id, data) => {
    const res = await api.patch(`/api/items/${id}`, data);
    if (res.data?.success && res.data?.data?.item) {
      setExtractedItems((prev) =>
        prev.map((item) => (item._id === id ? res.data.data.item : item))
      );
    }
  };

  const handleDeleteItem = async (id) => {
    await api.delete(`/api/items/${id}`);
    setExtractedItems((prev) => prev.filter((item) => item._id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            Capture Memory
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Zero-Storage Ephemeral
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Upload assignment circulars, fee notices, or messages. SnapKeep extracts all actionable items and discards the screenshot immediately.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {isProcessing ? (
        <div className="glass-panel p-10 rounded-3xl border border-indigo-500/30 shadow-2xl max-w-md mx-auto my-12 text-center space-y-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-100">Processing Screenshot...</h4>
            <p className="text-xs text-slate-400">
              Extracting deadlines, topics, and actions from the image.
            </p>
          </div>
          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin mx-auto mt-2" />
        </div>
      ) : extractedItems.length > 0 ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl animate-fadeIn space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {extractedItems.length} Structured Memory Item{extractedItems.length > 1 ? 's' : ''} Extracted!
                </h3>
                <p className="text-xs text-slate-400">
                  Original screenshot permanently discarded from memory.
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Snap Another
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {extractedItems.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onConfirm={(i) => setConfirmingItem(i)}
                onEdit={(i) => setEditingItem(i)}
                onKeep={() => {}}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[300px] ${
                previewUrl
                  ? 'border-indigo-500/50 bg-slate-900/80'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-3 w-full">
                  <img
                    src={previewUrl}
                    alt="Uploaded preview"
                    className="max-h-56 mx-auto rounded-xl object-contain border border-slate-700 shadow-md"
                  />
                  <p className="text-xs text-slate-400">
                    Click or drop another image to replace ({selectedFile?.name})
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      Drop screenshot here, or <span className="text-blue-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PNG, JPEG, WEBP (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col justify-between glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Personal Context / Caption</span>
              </div>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                Add optional context to guide AI priority, category, and action relevance:
              </p>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder="e.g. 'This is about my Software Engineering assignment' or 'I might register if I have time' or 'Mandatory college notice'..."
                className="w-full p-3.5 bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition leading-relaxed"
              />

              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-500">
                  Quick context signals:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    'Mandatory submission',
                    'Optional hackathon',
                    'Important exam fee',
                    'CS301 Coursework'
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setCaption(chip)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={!selectedFile || isProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Extract & Save Memory</span>
            </button>
          </div>
        </div>
      )}

      {confirmingItem && (
        <ConfirmModal
          item={confirmingItem}
          isOpen={!!confirmingItem}
          onClose={() => setConfirmingItem(null)}
          onConfirmed={handleConfirmedItem}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onUpdated={handleUpdatedItem}
        />
      )}
    </div>
  );
};
