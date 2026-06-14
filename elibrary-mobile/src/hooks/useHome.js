// src/hooks/useHome.js
import { useState, useEffect } from 'react';
import { fetchAllBooks } from '../api/bookApi';

export const useHome = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAllBooks();
      if (response.success) {
        setBooks(response.data);
      } else {
        setError(response.message || 'Gagal memuat data');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Pastikan backend menyala dan satu Wi-Fi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return { books, loading, error, refreshData: loadHomeData };
};