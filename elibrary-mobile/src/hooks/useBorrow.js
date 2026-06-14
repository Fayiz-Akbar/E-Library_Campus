// src/hooks/useBorrow.js
import { useState } from 'react';
import { requestBookLoan } from '../api/borrowApi';

export const useBorrow = () => {
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowError, setBorrowError] = useState(null);

  const handleBorrowSubmit = async (book, onSuccess) => {
    try {
      setBorrowLoading(true);
      setBorrowError(null);

      const result = await requestBookLoan(book.id);

      if (result.success) {
        if (onSuccess) onSuccess(result.message || `Buku "${book.title}" berhasil dipinjam!`);
      } else {
        setBorrowError(result.message || 'Gagal mengajukan peminjaman.');
      }
    } catch (err) {
      setBorrowError('Koneksi gagal. Pastikan backend Express kamu menyala.');
    } finally {
      setBorrowLoading(false);
    }
  };

  return {
    borrowLoading,
    borrowError,
    handleBorrowSubmit,
  };
};