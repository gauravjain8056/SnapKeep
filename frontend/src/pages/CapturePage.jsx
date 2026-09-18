import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, AlertCircle, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import api from '../services/api';
import { ItemCard } from '../components/dashboard/ItemCard';
import { ConfirmModal } from '../components/items/ConfirmModal';
import { EditItemModal } from '../components/items/EditItemModal';

export const CapturePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile]   = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [caption, setCaption]             = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isProcessing, setIsProcessing]   = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);
  const [error, setError]                 = useState('');
  const [confirmingItem, setConfirmingItem] = useState(null);
  const [editingItem, setEditingItem]     = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG, PNG, WEBP).');
        return;
      }
      setError('');
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
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
    setIsCompressing(true);
    let fileToUpload;
    try {
      fileToUpload = await imageCompression(selectedFile, {
        maxSizeMB: 2,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
        fileType: selectedFile.type || 'image/jpeg'
      });
    } catch {
      fileToUpload = selectedFile;
    } finally {
      setIsCompressing(false);
    }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', fileToUpload, selectedFile.name);
      formData.append('caption', caption);
      const res = await api.post('/api/items/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && (res.data?.data?.items || res.data?.data?.item)) {
        const items = res.data.data.items || [res.data.data.item];
        setExtractedItems(items);
        const firstUnconfirmed = items.find((i) => i.needsConfirmation);
        if (firstUnconfirmed) setConfirmingItem(firstUnconfirmed);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            Capture Memory
            <span className="text-xs px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900 font-mono">
              Zero-Storage Ephemeral
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Upload assignment circulars, fee notices, or messages. SnapKeep extracts all actionable items and discards the screenshot immediately.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-3 rounded bg-red-950/60 border border-red-900 text-red-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {/* Compressing / Processing / Results */}
      {isCompressing ? (
        <div className="bg-zinc-950 p-8 rounded-lg border border-zinc-800 max-w-md mx-auto my-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">Compressing Image…</h4>
            <p className="text-xs text-zinc-400">Optimising screenshot before secure upload.</p>
          </div>
          <div className="w-6 h-6 border-2 border-zinc-800 border-t-zinc-500 rounded-full animate-spin mx-auto mt-2" />
        </div>
      ) : isProcessing ? (
        <div className="bg-zinc-950 p-8 rounded-lg border border-zinc-800 max-w-md mx-auto my-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-white">Processing Screenshot…</h4>
            <p className="text-xs text-zinc-400">Extracting deadlines, topics, and actions from the image.</p>
          </div>
          <div className="w-6 h-6 border-2 border-zinc-800 border-t-blue-500 rounded-full animate-spin mx-auto mt-2" />
        </div>
      ) : extractedItems.length > 0 ? (

        <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-zinc-900 text-blue-400 border border-zinc-800">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {extractedItems.length} Structured Memory Item{extractedItems.length > 1 ? 's' : ''} Extracted
                </h3>
                <p className="text-xs text-zinc-400">Original screenshot was permanently discarded from memory.</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded bg-black hover:bg-zinc-900 text-zinc-300 text-xs font-medium border border-zinc-800 transition-colors"
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

      /* Upload Form */
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Drop Zone */}
          <div className="md:col-span-7 space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border border-dashed rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[280px] ${
                previewUrl
                  ? 'border-blue-800 bg-zinc-950'
                  : 'border-zinc-800 hover:border-zinc-700 bg-black hover:bg-zinc-950'
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
                    className="max-h-56 mx-auto rounded object-contain border border-zinc-800"
                  />
                  <p className="text-xs text-zinc-400">
                    Click or drop another image to replace ({selectedFile?.name})
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Drop screenshot here, or{' '}
                      <span className="text-blue-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Supports PNG, JPEG, WEBP (Max 10MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Caption & Process */}
          <div className="md:col-span-5 flex flex-col justify-between bg-zinc-950 p-5 rounded-lg border border-zinc-800 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <span>Context / Caption (Optional)</span>
              </div>
              <p className="text-xs text-zinc-500 mb-2.5 leading-relaxed">
                Add context to guide priority and action relevance:
              </p>

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder="e.g. 'Software Engineering assignment' or 'Semester fee notice'…"
                className="w-full p-2.5 bg-black border border-zinc-800 focus:border-blue-600 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors leading-relaxed"
              />

              <div className="mt-2.5 space-y-1.5">
                <span className="text-[11px] font-medium text-zinc-500">
                  Quick tags:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    'Mandatory submission',
                    'Optional hackathon',
                    'Important fee notice',
                    'Coursework deadline',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setCaption(chip)}
                      className="px-2 py-0.5 rounded bg-black hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors text-xs"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={!selectedFile || isCompressing || isProcessing}
              className="w-full py-2.5 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-2 mt-3"
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
