// src/api/categoryApi.js
import axiosInstance from './axiosInstance';

export const fetchAllCategories = async () => {
  const response = await axiosInstance.get('/categories');
  return response.data; // Mengembalikan { success, message, data }
};