// src/hooks/useHome.js
import { useState, useEffect } from 'react';
import { fetchAllBooks } from '../api/bookApi';
import { fetchTransactionHistory } from '../api/transactionApi'; // 🚀 TAMBAHKAN: Ambil API transaksi
import { useAuth } from './useAuth'; // 🚀 TAMBAHKAN: Ambil data auth login mahasiswa

export const useHome = () => {
  const { user } = useAuth(); // Dapatkan info user id mahasiswa yang login
  const [books, setBooks] = useState([]);
  const [activeLoansCount, setActiveLoansCount] = useState(0); // 🚀 STATE BARU: Counter buku aktif
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Ambil Data Katalog Buku
      const bookResponse = await fetchAllBooks();
      if (bookResponse.success) {
        setBooks(bookResponse.data);
      } else {
        setError(bookResponse.message || 'Gagal memuat data');
      }

      // 2. Ambil Riwayat Transaksi & Hitung yang Masih Dipinjam
      if (user?.id) {
        const historyResponse = await fetchTransactionHistory({ userId: user.id });
        if (historyResponse.success && Array.isArray(historyResponse.data)) {
          // Filter data transaksi yang statusnya masih 'borrowed' (sedang dipinjam)
          const currentBorrowedBooks = historyResponse.data.filter(
            (tx) => tx.status === 'borrowed'
          );
          setActiveLoansCount(currentBorrowedBooks.length);
        }
      }

    } catch (err) {
      setError('Tidak dapat terhubung ke server. Pastikan backend menyala dan satu Wi-Fi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, [user?.id]); // Triger reload jika ID user berubah

  return { books, activeLoansCount, loading, error, refreshData: loadHomeData }; // 🚀 Kembalikan activeLoansCount
};