// src/api/borrowApi.js
import axiosInstance from './axiosInstance';

export const requestBookLoan = async (bookId) => {
  // Mengirimkan payload bookId ke endpoint /borrowings backend Express kamu
  const response = await axiosInstance.post('/borrowings', { bookId });
  return response.data; // Mengembalikan { success, message, data }
};