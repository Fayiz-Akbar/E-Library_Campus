// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  // Otomatis membaca URL dari file .env lokal laptop masing-masing pengembang
  baseURL: process.env.EXPO_PUBLIC_API_URL, 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;