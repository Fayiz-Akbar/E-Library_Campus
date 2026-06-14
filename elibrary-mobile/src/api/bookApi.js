// src/api/bookApi.js
import axiosInstance from './axiosInstance';

export const fetchAllBooks = async (search = '', category = '') => {
  const response = await axiosInstance.get(`/books?search=${search}&category=${category}`);
  return response.data; // Mengembalikan standardized envelope JSON { success, message, data }
};