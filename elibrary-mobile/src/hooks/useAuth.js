// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, fetchProfile } from '../api/authApi';

const STORAGE_KEY_TOKEN = '@elibrary_token';
const STORAGE_KEY_USER = '@elibrary_user';

/**
 * Custom hook untuk mengelola seluruh state dan logika autentikasi.
 * Memisahkan logic dari UI agar screen tetap clean (sesuai PRD).
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isLoggedIn = !!token;
  const isAdmin = user?.role === 'admin';

  /**
   * Memuat sesi login yang tersimpan di AsyncStorage saat app pertama dibuka.
   * Digunakan oleh SplashScreen untuk menentukan navigasi awal.
   */
  const loadStoredSession = useCallback(async () => {
    try {
      setLoading(true);
      const [storedToken, storedUser] = await AsyncStorage.multiGet([
        STORAGE_KEY_TOKEN,
        STORAGE_KEY_USER,
      ]);

      if (storedToken[1] && storedUser[1]) {
        setToken(storedToken[1]);
        setUser(JSON.parse(storedUser[1]));
      }
    } catch (error) {
      // Jika gagal membaca storage, anggap belum login
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Menyimpan sesi login ke AsyncStorage agar persisten
   */
  const saveSession = async (tokenData, userData) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEY_TOKEN, tokenData],
      [STORAGE_KEY_USER, JSON.stringify(userData)],
    ]);
    setToken(tokenData);
    setUser(userData);
  };

  /**
   * Proses login — mengirim kredensial ke server dan menyimpan sesi
   */
  const login = async (email, password) => {
    try {
      setAuthError(null);
      const response = await loginUser(email, password);

      if (response.success) {
        await saveSession(response.data.token, response.data.user);
        return response;
      }

      setAuthError(response.message);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Tidak dapat terhubung ke server. Periksa koneksi jaringan Anda.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  /**
   * Proses registrasi — mendaftarkan akun baru dan langsung login
   */
  const register = async (name, email, password) => {
    try {
      setAuthError(null);
      const response = await registerUser(name, email, password);

      if (response.success) {
        await saveSession(response.data.token, response.data.user);
        return response;
      }

      setAuthError(response.message);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Gagal mendaftarkan akun. Silakan coba lagi.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  /**
   * Refresh data profil user dari server (sinkronisasi)
   */
  const refreshProfile = async () => {
    try {
      const response = await fetchProfile();
      if (response.success) {
        setUser(response.data);
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.data));
      }
    } catch (error) {
      // Jika token expired, logout otomatis
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  /**
   * Proses logout — menghapus sesi dari AsyncStorage
   */
  const logout = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    loadStoredSession();
  }, [loadStoredSession]);

  return {
    user,
    token,
    loading,
    authError,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    refreshProfile,
    loadStoredSession,
    setAuthError,
  };
};
