import React, { useState, useEffect } from 'react';
import { Clock, Bookmark, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ItemCard } from '../components/dashboard/ItemCard';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RetentionPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtendingAll, setIsExtendingAll] = useState(false);

  const fetchExpiringItems = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/retention/expiring');
      if (res.data?.success && res.data?.data?.items) {
        setItems(res.data.data.items);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to fetch expiring items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const handleKeep = async (itemId) => {
    try {
      await api.post(`/api/items/${itemId}/keep`);
      fetchExpiringItems();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to extend retention');
    }
  };

  const handleKeepAll = async () => {
    try {
      setIsExtendingAll(true);
      for (const item of items) {
        await api.post(`/api/items/${item._id}/keep`);
      }
      fetchExpiringItems();
    } catch (err) {
      alert('Failed to extend all items');
    } finally {
      setIsExtendingAll(false);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await api.delete(`/api/items/${itemId}`);
      setItems((prev) => prev.filter((i) => i._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete item');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            Expiring Items (7-Day Retention)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Items whose meaningful dates have passed enter a 7-day retention period before deletion. Use KEEP to extend retention by 7 days.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={handleKeepAll}
            disabled={isExtendingAll}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            {isExtendingAll ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Bookmark className="w-4 h-4" /> KEEP All Items (+7 Days)
              </>
            )}
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner message="Checking expiring items..." />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onKeep={handleKeep}
              onDelete={handleDelete}
              onConfirm={() => navigate('/')}
              onEdit={() => navigate('/')}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle}
          title="No items in retention!"
          description="None of your saved items are currently eligible for deletion. SnapKeep keeps your information organized and active until their dates pass."
          actionLabel="Back to Dashboard"
          onAction={() => navigate('/')}
        />
      )}
    </div>
  );
};
