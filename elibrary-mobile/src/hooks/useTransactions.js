// src/hooks/useTransactions.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  exportTransactionReportCsv,
  fetchAdminTransactions,
  fetchTransactionReport,
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

const getCurrentMonthDateRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const formatDate = (date) => date.toISOString().slice(0, 10);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
};

export const useTransactionReport = ({ autoLoad = true } = {}) => {
  const defaultRange = useMemo(() => getCurrentMonthDateRange(), []);
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [summary, setSummary] = useState({
    total_transactions: 0,
    borrowed: 0,
    returned: 0,
    overdue: 0,
    lost: 0,
    damaged: 0,
    total_fines: 0,
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [csvText, setCsvText] = useState('');

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchTransactionReport({ startDate, endDate });
      setSummary(response.data?.summary || {});
      setItems(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (reportError) {
      setError(getApiErrorMessage(reportError, 'Gagal memuat laporan transaksi.'));
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  const exportCsv = useCallback(async () => {
    try {
      setExporting(true);
      setError('');
      const csv = await exportTransactionReportCsv({ startDate, endDate });
      setCsvText(csv || '');
      return { success: true, data: csv || '' };
    } catch (exportError) {
      const message = getApiErrorMessage(exportError, 'Gagal export laporan transaksi.');
      setError(message);
      return { success: false, message };
    } finally {
      setExporting(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    if (autoLoad) {
      loadReport();
    }
  }, [autoLoad, loadReport]);

  return {
    startDate,
    endDate,
    summary,
    items,
    loading,
    exporting,
    error,
    csvText,
    setStartDate,
    setEndDate,
    loadReport,
    exportCsv,
  };
};
