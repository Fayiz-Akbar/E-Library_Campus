// src/api/borrowApi.js
import axiosInstance from './axiosInstance';

export const requestBookLoan = async (bookId) => {
  const response = await axiosInstance.post('/transactions/borrow', { book_id: bookId });
  return response.data;
};
