// src/hooks/useTransactions.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchAdminTransactions,
  fetchTransactionHistory,
  fetchTransactionNotifications,
  overrideTransactionStatus,
} from '../api/transactionApi';
import { useAuth } from '../context/AuthContext';

export const HISTORY_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'borrowed', label: 'Dipinjam' },
  { key: 'returned', label: 'Dikembalikan' },
  { key: 'overdue', label: 'Terlambat' },
];

export const ADMIN_TRANSACTION_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'borrowed', label: 'Dipinjam' },
  { key: 'returned', label: 'Dikembalikan' },
  { key: 'overdue', label: 'Terlambat' },
  { key: 'lost', label: 'Hilang' },
  { key: 'damaged', label: 'Rusak' },
];

export const OVERRIDE_STATUS_OPTIONS = [
  { key: 'lost', label: 'Hilang' },
  { key: 'damaged', label: 'Rusak' },
  { key: 'returned', label: 'Dikembalikan' },
];

const getApiErrorMessage = (error, fallbackMessage) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message === 'Network Error') return 'Tidak dapat terhubung ke server.';
  if (error?.message?.includes('timeout')) return 'Request timeout. Coba lagi beberapa saat.';
  return fallbackMessage;
};

export const useTransactions = ({ autoLoadHistory = true, autoLoadNotifications = false } = {}) => {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [notificationError, setNotificationError] = useState('');

  const userId = user?.id;

  const loadHistory = useCallback(async (nextStatus = selectedStatus) => {
    if (!userId) {
      setHistory([]);
      setHistoryError('Data user belum tersedia.');
      return;
    }

    try {
      setHistoryLoading(true);
      setHistoryError('');
      const response = await fetchTransactionHistory({ userId, status: nextStatus });
      setHistory(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setHistoryError(getApiErrorMessage(error, 'Gagal memuat riwayat peminjaman.'));
    } finally {
      setHistoryLoading(false);
    }
  }, [selectedStatus, userId]);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setNotificationError('Data user belum tersedia.');
      return;
    }

    try {
      setNotificationLoading(true);
      setNotificationError('');
      const response = await fetchTransactionNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setNotificationError(getApiErrorMessage(error, 'Gagal memuat notifikasi jatuh tempo.'));
    } finally {
      setNotificationLoading(false);
    }
  }, [userId]);

  const handleStatusChange = useCallback((nextStatus) => {
    setSelectedStatus(nextStatus);
  }, []);

  const activeBorrowCount = useMemo(
    () => history.filter((item) => item.status === 'borrowed' || item.status === 'overdue').length,
    [history]
  );

  useEffect(() => {
    if (autoLoadHistory) {
      loadHistory(selectedStatus);
    }
  }, [autoLoadHistory, loadHistory, selectedStatus]);

  useEffect(() => {
    if (autoLoadNotifications) {
      loadNotifications();
    }
  }, [autoLoadNotifications, loadNotifications]);

  return {
    selectedStatus,
    history,
    notifications,
    historyLoading,
    notificationLoading,
    historyError,
    notificationError,
    activeBorrowCount,
    handleStatusChange,
    loadHistory,
    loadNotifications,
  };
};

export const useAdminTransactions = ({ autoLoad = true } = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const buildFilters = useCallback((overrides = {}) => {
    const status = overrides.status ?? selectedStatus;
    const search = overrides.search ?? searchQuery;
    const start = overrides.startDate ?? startDate;
    const end = overrides.endDate ?? endDate;

    return {
      ...(status && status !== 'all' ? { status } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(start.trim() ? { start_date: start.trim() } : {}),
      ...(end.trim() ? { end_date: end.trim() } : {}),
    };
  }, [endDate, searchQuery, selectedStatus, startDate]);

  const loadAdminTransactions = useCallback(async (filterOverrides = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchAdminTransactions(buildFilters(filterOverrides));
      setTransactions(Array.isArray(response.data) ? response.data : []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Gagal memuat data transaksi admin.'));
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  const handleStatusChange = useCallback((nextStatus) => {
    setSelectedStatus(nextStatus);
  }, []);

  const submitOverride = useCallback(async ({ transactionId, status, note }) => {
    try {
      setSubmitting(true);
      setError('');
      const response = await overrideTransactionStatus({ transactionId, status, note });
      await loadAdminTransactions();
      return response;
    } catch (overrideError) {
      const message = getApiErrorMessage(overrideError, 'Gagal override status transaksi.');
      setError(message);
      return { success: false, message };
    } finally {
      setSubmitting(false);
    }
  }, [loadAdminTransactions]);

  const stats = useMemo(() => ({
    total: transactions.length,
    active: transactions.filter((item) => item.status === 'borrowed').length,
    overdue: transactions.filter((item) => item.status === 'overdue').length,
    completed: transactions.filter((item) => item.status === 'returned').length,
  }), [transactions]);

  useEffect(() => {
    if (!autoLoad) return undefined;
    const debounce = setTimeout(() => {
      loadAdminTransactions();
    }, 350);
    return () => clearTimeout(debounce);
  }, [autoLoad, loadAdminTransactions]);

  return {
    transactions,
    selectedStatus,
    searchQuery,
    startDate,
    endDate,
    loading,
    submitting,
    error,
    stats,
    setSearchQuery,
    setStartDate,
    setEndDate,
    handleStatusChange,
    loadAdminTransactions,
    submitOverride,
  };
};
