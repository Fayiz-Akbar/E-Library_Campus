// src/api/bookApi.js
import axiosInstance from './axiosInstance';

export const fetchAllBooks = async (search = '', category = '') => {
  const response = await axiosInstance.get(`/books?search=${search}&category=${category}`);
  return response.data; // Mengembalikan standardized envelope JSON { success, message, data }
};

/**
 * Mendaftarkan buku baru ke perpustakaan + memicu terbitnya QR Code otomatis
 * @param {Object} bookData - Mengandung field { title, author, publisher, isbn, stock, summary, cover_image }
 */
export const adminCreateBook = async (bookData) => {
  const response = await axiosInstance.post('/books', bookData);
  return response.data; // Mengembalikan { success, message, data }
};

/**
 * Mengubah data/informasi spesifikasi serta stok buku di database
 * @param {string|number} id - ID Buku yang ingin diubah
 * @param {Object} bookData - Objek data baru yang dikirim untuk update
 */
export const adminUpdateBook = async (id, bookData) => {
  const response = await axiosInstance.put(`/books/${id}`, bookData);
  return response.data; // Mengembalikan { success, message, data }
};

/**
 * Menghapus koleksi buku dari sistem perpustakaan secara permanen
 * @param {string|number} id - ID Buku yang ingin dihapus
 */
export const adminDeleteBook = async (id) => {
  const response = await axiosInstance.delete(`/books/${id}`);
  return response.data; // Mengembalikan { success, message, data }
};