// src/hooks/useCatalog.js
import { useState, useEffect } from 'react';
import { fetchAllBooks } from '../api/bookApi';
import { fetchAllCategories } from '../api/categoryApi';

export const useCatalog = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State Filter Pencarian
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // Kosong berarti 'Semua Kategori'

  const loadCatalogData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Ambil data buku dengan query string search & category
      const bookRes = await fetchAllBooks(search, selectedCategory);
      if (bookRes.success) {
        setBooks(bookRes.data);
      }

      // 2. Ambil data list kategori untuk tombol filter (cukup sekali di awal)
      if (categories.length === 0) {
        const catRes = await fetchAllCategories();
        if (catRes.success) {
          setCategories(catRes.data);
        }
      }
    } catch (err) {
      setError('Gagal memuat katalog buku. Pastikan backendExpress/Supabase menyala.');
    } finally {
      setLoading(false);
    }
  };

  // Efek tak-langsung (Debounce) untuk pencarian teks agar hemat kuota/resource server
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      loadCatalogData();
    }, 400); // Menunggu user selesai mengetik selama 400ms

    return () => clearTimeout(delayTimer);
  }, [search, selectedCategory]);

  return {
    books,
    categories,
    loading,
    error,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    refreshCatalog: loadCatalogData,
  };
};