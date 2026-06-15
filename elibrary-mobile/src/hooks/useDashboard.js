// src/hooks/useDashboard.js
import { useCallback, useEffect, useState } from 'react';
import { fetchAdminDashboard } from '../api/dashboardApi';

const initialDashboard = {
  users: {
    total_users: 0,
    active_users: 0,
    suspended_users: 0,
    admin_count: 0,
    student_count: 0,
  },
  books: {
    total_titles: 0,
    total_books_stock: 0,
    total_available_stock: 0,
  },
  transactions: {
    active_transactions: 0,
    overdue_transactions: 0,
    returned_transactions: 0,
    total_fines: 0,
  },
  warnings: {},
};

const getApiErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message === 'Network Error') return 'Tidak dapat terhubung ke server.';
  if (error?.message?.includes('timeout')) return 'Request timeout. Coba lagi beberapa saat.';
  return 'Gagal memuat dashboard admin.';
};

export const useDashboard = ({ autoLoad = true } = {}) => {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchAdminDashboard();
      setDashboard(response.data || initialDashboard);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadDashboard();
    }
  }, [autoLoad, loadDashboard]);

  return {
    dashboard,
    loading,
    error,
    loadDashboard,
  };
};
