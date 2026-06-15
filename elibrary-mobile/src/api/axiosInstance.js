// src/api/axiosInstance.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_TOKEN = '@elibrary_token';

const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: menyisipkan JWT token ke setiap request secara otomatis
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: menangkap error global (misal token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Biarkan error diteruskan ke catch block di masing-masing API call
    return Promise.reject(error);
  }
);

export default axiosInstance;