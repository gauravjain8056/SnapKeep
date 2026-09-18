import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RefreshCw, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { useDebounce } from '../hooks/useDebounce';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [status, setStatus] = useState('all');
  const [needsConfirmationOnly, setNeedsConfirmationOnly] = useState(false);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });
  const [statsData, setStatsData] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = { page, limit: 12 };
      if (category !== 'all') params.category = category;
      if (priority !== 'all') params.priority = priority;
      if (status !== 'all') params.status = status;
      if (needsConfirmationOnly) params.needsConfirmation = 'true';
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await api.get('/api/items', { params });
      if (res.data?.success && res.data?.data) {
        setItems(res.data.data.items || []);
        if (res.data.data.pagination) setPagination(res.data.data.pagination);
        if (res.data.data.stats) setStatsData(res.data.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  }, [category, priority, status, needsConfirmationOnly, debouncedSearch, page]);

  useEffect(() => { setPage(1); }, [category, priority, status, needsConfirmationOnly, debouncedSearch]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleNaturalSearch = async (queryText) => {
    try {
      setIsSearching(true);
      const res = await api.post('/api/query', { query: queryText });
      if (res.data?.success && res.data?.data) setSearchResult(res.data.data);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'AI Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = useCallback(() => {
    setSearchResult(null);
    fetchItems();
  }, [fetchItems]);

  const handleKeep = useCallback(async (itemId) => {
    try {
      const res = await api.post(`/api/items/${itemId}/keep`);
      if (res.data?.success) fetchItems();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to extend retention');
    }
  }, [fetchItems]);

  const handleDelete = useCallback(async (itemId) => {
    try {
      const res = await api.delete(`/api/items/${itemId}`);
      if (res.data?.success) {
        setItems((prev) => prev.filter((i) => i._id !== itemId));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          pages: Math.max(1, Math.ceil((prev.total - 1) / prev.limit)),
        }));
        setSearchResult((prev) => {
          if (!prev) return null;
          return { ...prev, items: prev.items.filter((i) => i._id !== itemId) };
        });
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete item');
    }
  }, []);

  const handleUpdate = async (itemId, updatedData) => {
    const res = await api.patch(`/api/items/${itemId}`, updatedData);
    if (res.data?.success) fetchItems();
  };

  const handleConfirm = async (itemId, confirmedData) => {
    const res = await api.post(`/api/items/${itemId}/confirm`, confirmedData);
    if (res.data?.success) fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setPriority('all');
    setStatus('all');
    setNeedsConfirmationOnly(false);
    setPage(1);
  };

  const handleFilterSelectFromStats = ({ priority: p, dueSoon, needsConfirmation, status: s }) => {
    if (p) setPriority(p);
    if (s) setStatus(s);
    if (needsConfirmation) setNeedsConfirmationOnly(true);
    setPage(1);
  };

  const paginationBtnBase =
    'flex items-center gap-1 px-3 py-1.5 rounded-xl border border-purple-900/30 bg-black text-xs font-semibold text-zinc-400 hover:bg-purple-900/20 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DailyWarningBanner onRefresh={fetchItems} />

      <NaturalSearchBox onSearch={handleNaturalSearch} isLoading={isSearching} />

      {searchResult ? (
        <SearchResultsView
          searchResult={searchResult}
          onClearSearch={handleClearSearch}
          onEdit={setEditItem}
          onConfirm={setConfirmItem}
          onKeep={handleKeep}
          onDelete={handleDelete}
          onViewDetails={setDetailItem}
        />
      ) : (
        <>
          <StatsOverview items={items} statsData={statsData} onFilterSelect={handleFilterSelectFromStats} />

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
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Saved Action Memories ({pagination.total || items.length})
              </h3>
              <button
                onClick={fetchItems}
                title="Refresh memories"
                className="p-1.5 text-zinc-600 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {isLoading ? (
              <LoadingSpinner message="Retrieving your memories…" />
            ) : error ? (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/25 text-red-300 text-sm text-center">
                {error}
              </div>
            ) : items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <ItemCard
                      key={item._id}
                      item={item}
                      onEdit={setEditItem}
                      onConfirm={setConfirmItem}
                      onKeep={handleKeep}
                      onDelete={handleDelete}
                      onViewDetails={setDetailItem}
                    />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-purple-900/20">
                    <div className="text-xs text-zinc-600 font-medium">
                      Showing{' '}
                      <span className="text-zinc-300 font-semibold">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      to{' '}
                      <span className="text-zinc-300 font-semibold">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of{' '}
                      <span className="text-zinc-300 font-semibold">{pagination.total}</span> memories
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={pagination.page <= 1}
                        className={paginationBtnBase}
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
                          .map((p, idx, arr) => {
                            const prevPageNum = arr[idx - 1];
                            return (
                              <React.Fragment key={p}>
                                {prevPageNum && p - prevPageNum > 1 && (
                                  <span className="px-1 text-zinc-600 text-xs">…</span>
                                )}
                                <button
                                  onClick={() => setPage(p)}
                                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                                    p === pagination.page
                                      ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/30'
                                      : 'bg-black border border-purple-900/30 text-zinc-500 hover:bg-purple-900/20 hover:text-zinc-200'
                                  }`}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))}
                        disabled={pagination.page >= pagination.pages}
                        className={paginationBtnBase}
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={Inbox}
                title="No action memories found"
                description={
                  search || category !== 'all' || priority !== 'all' || needsConfirmationOnly
                    ? 'No memories match your current filters. Try resetting filters.'
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
