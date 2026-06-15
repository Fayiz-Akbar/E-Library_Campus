// src/hooks/useTransactions.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchTransactionHistory, fetchTransactionNotifications } from '../api/transactionApi';
import { useAuth } from '../context/AuthContext';

export const HISTORY_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'borrowed', label: 'Dipinjam' },
  { key: 'returned', label: 'Dikembalikan' },
  { key: 'overdue', label: 'Terlambat' },
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
