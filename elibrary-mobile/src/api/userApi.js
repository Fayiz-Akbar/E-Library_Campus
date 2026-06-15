// src/api/userApi.js
import axiosInstance from './axiosInstance';

/**
 * Mengambil daftar semua anggota perpustakaan (admin only)
 * @param {string} search - Kata kunci pencarian nama/email
 */
export const fetchAllUsers = async (search = '') => {
  const response = await axiosInstance.get(`/users?search=${search}`);
  return response.data;
};

/**
 * Toggle status anggota (active ↔ suspended)
 * @param {number} userId - ID anggota yang akan di-toggle
 */
export const toggleUserStatus = async (userId) => {
  const response = await axiosInstance.put(`/users/${userId}/status`);
  return response.data;
};

/**
 * Mengubah role anggota
 * @param {number} userId - ID anggota
 * @param {string} role - Role baru ('student' atau 'admin')
 */
export const updateUserRole = async (userId, role) => {
  const response = await axiosInstance.put(`/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Mengambil statistik anggota perpustakaan (admin only)
 */
export const fetchUserStats = async () => {
  const response = await axiosInstance.get('/users/stats');
  return response.data;
};
