// src/api/authApi.js
import axiosInstance from './axiosInstance';

/**
 * Mendaftarkan akun baru ke sistem perpustakaan
 * @param {string} name - Nama lengkap
 * @param {string} email - Alamat email
 * @param {string} password - Password (min 6 karakter)
 */
export const registerUser = async (name, email, password) => {
  const response = await axiosInstance.post('/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
};

/**
 * Login ke sistem dan mendapatkan token JWT
 * @param {string} email - Alamat email terdaftar
 * @param {string} password - Password akun
 */
export const loginUser = async (email, password) => {
  const response = await axiosInstance.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Mengambil data profil user yang sedang login
 */
export const fetchProfile = async () => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};

/**
 * Mengupdate data profil user (nama & email)
 * @param {Object} data - { name, email }
 */
export const updateProfile = async (data) => {
  const response = await axiosInstance.put('/auth/profile', data);
  return response.data;
};
