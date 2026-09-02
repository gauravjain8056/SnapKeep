import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RefreshCw, Sparkles, Inbox } from 'lucide-react';
import api from '../services/api';
import { DailyWarningBanner } from '../components/dashboard/DailyWarningBanner';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { ItemFilterBar } from '../components/dashboard/ItemFilterBar';
import { ItemCard } from '../components/dashboard/ItemCard';
import { NaturalSearchBox } from '../components/search/NaturalSearchBox';
import { SearchResultsView } from '../components/search/SearchResultsView';
import { ItemDetailModal } from '../components/items/ItemDetailModal';
import { EditItemModal } from '../components/items/EditItemModal';
import { ConfirmModal } from '../components/items/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [needsConfirmationOnly, setNeedsConfirmationOnly] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = {};
      if (category !== 'all') params.category = category;
      if (priority !== 'all') params.priority = priority;
      if (status !== 'all') params.status = status;
      if (needsConfirmationOnly) params.needsConfirmation = 'true';
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/api/items', { params });
      if (res.data?.success && res.data?.data?.items) {
        setItems(res.data.data.items);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  }, [category, priority, status, needsConfirmationOnly, search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleNaturalSearch = async (queryText) => {
    try {
      setIsSearching(true);
      const res = await api.post('/api/query', { query: queryText });
      if (res.data?.success && res.data?.data) {
        setSearchResult(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'AI Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResult(null);
    fetchItems();
  };

  const handleKeep = async (itemId) => {
    try {
      const res = await api.post(`/api/items/${itemId}/keep`);
      if (res.data?.success) {
        fetchItems();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to extend retention');
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const res = await api.delete(`/api/items/${itemId}`);
      if (res.data?.success) {
        setItems((prev) => prev.filter((i) => i._id !== itemId));
        if (searchResult) {
          setSearchResult((prev) => ({
            ...prev,
            items: prev.items.filter((i) => i._id !== itemId)
          }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete item');
    }
  };

  const handleUpdate = async (itemId, updatedData) => {
    const res = await api.patch(`/api/items/${itemId}`, updatedData);
    if (res.data?.success) {
      fetchItems();
    }
  };

  const handleConfirm = async (itemId, confirmedData) => {
    const res = await api.post(`/api/items/${itemId}/confirm`, confirmedData);
    if (res.data?.success) {
      fetchItems();
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setPriority('all');
    setStatus('all');
    setNeedsConfirmationOnly(false);
  };

  const handleFilterSelectFromStats = ({ priority: p, dueSoon, needsConfirmation, status: s }) => {
    if (p) setPriority(p);
    if (s) setStatus(s);
    if (needsConfirmation) setNeedsConfirmationOnly(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DailyWarningBanner onRefresh={fetchItems} />

      <NaturalSearchBox onSearch={handleNaturalSearch} isLoading={isSearching} />

      {searchResult ? (
        <SearchResultsView
          searchResult={searchResult}
          onClearSearch={handleClearSearch}
          onEdit={(item) => setEditItem(item)}
          onConfirm={(item) => setConfirmItem(item)}
          onKeep={handleKeep}
          onDelete={handleDelete}
          onViewDetails={(item) => setDetailItem(item)}
        />
      ) : (
        <>
          <StatsOverview items={items} onFilterSelect={handleFilterSelectFromStats} />

          <ItemFilterBar
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            priority={priority}
            setPriority={setPriority}
            status={status}
            setStatus={setStatus}
            needsConfirmationOnly={needsConfirmationOnly}
            setNeedsConfirmationOnly={setNeedsConfirmationOnly}
            onReset={handleResetFilters}
          />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Saved Action Memories ({items.length})
              </h3>
              <button
                onClick={fetchItems}
                title="Refresh memories"
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <LoadingSpinner message="Retrieving your memories..." />
            ) : error ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm text-center">
                {error}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onEdit={(i) => setEditItem(i)}
                    onConfirm={(i) => setConfirmItem(i)}
                    onKeep={handleKeep}
                    onDelete={handleDelete}
                    onViewDetails={(i) => setDetailItem(i)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title="No action memories found"
                description={
                  search || category !== 'all' || priority !== 'all' || needsConfirmationOnly
                    ? 'No memories match your current active filters. Try resetting filters.'
                    : 'Your memory space is clean! Capture your first assignment or notice screenshot.'
                }
                actionLabel="Capture Screenshot"
                onAction={() => navigate('/capture')}
              />
            )}
          </div>
        </>
      )}

      {detailItem && (
        <ItemDetailModal
          item={detailItem}
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={(i) => setEditItem(i)}
          onConfirm={(i) => setConfirmItem(i)}
          onKeep={handleKeep}
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          onUpdated={handleUpdate}
        />
      )}

      {confirmItem && (
        <ConfirmModal
          item={confirmItem}
          isOpen={!!confirmItem}
          onClose={() => setConfirmItem(null)}
          onConfirmed={handleConfirm}
        />
      )}
    </div>
  );
};
