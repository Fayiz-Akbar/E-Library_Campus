// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, fetchProfile } from '../api/authApi';

const STORAGE_KEY_TOKEN = '@elibrary_token';
const STORAGE_KEY_USER = '@elibrary_user';

// Membuat context auth — state auth dibagikan ke seluruh pohon komponen
const AuthContext = createContext(null);

/**
 * Provider yang membungkus seluruh app agar semua screen
 * membaca dari satu sumber state auth yang sama (single source of truth).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const isLoggedIn = !!token;
  const isAdmin = user?.role === 'admin';

  /**
   * Memuat sesi login tersimpan saat app pertama kali dibuka.
   * Dijalankan sekali saat AuthProvider di-mount.
   */
  const loadStoredSession = useCallback(async () => {
    try {
      setIsLoadingSession(true);
      const [storedToken, storedUser] = await AsyncStorage.multiGet([
        STORAGE_KEY_TOKEN,
        STORAGE_KEY_USER,
      ]);

      if (storedToken[1] && storedUser[1]) {
        setToken(storedToken[1]);
        setUser(JSON.parse(storedUser[1]));
      }
    } catch (error) {
      // Jika gagal membaca storage, anggap user belum login
      setToken(null);
      setUser(null);
    } finally {
      setIsLoadingSession(false);
    }
  }, []);

  /**
   * Menyimpan sesi login ke AsyncStorage sekaligus memperbarui state global
   */
  const saveSession = async (newToken, newUser) => {
    await AsyncStorage.multiSet([
      [STORAGE_KEY_TOKEN, newToken],
      [STORAGE_KEY_USER, JSON.stringify(newUser)],
    ]);
    setToken(newToken);
    setUser(newUser);
  };

  /**
   * Proses login — kirim kredensial ke server dan simpan sesi
   * @returns {{ success: boolean, message: string, data?: object }}
   */
  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);

      if (response.success) {
        await saveSession(response.data.token, response.data.user);
      }

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Tidak dapat terhubung ke server. Periksa koneksi Wi-Fi Anda.';
      return { success: false, message };
    }
  };

  /**
   * Proses registrasi — daftarkan akun baru dan simpan sesi langsung
   * @returns {{ success: boolean, message: string, data?: object }}
   */
  const register = async (name, email, password) => {
    try {
      const response = await registerUser(name, email, password);

      if (response.success) {
        await saveSession(response.data.token, response.data.user);
      }

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Tidak dapat terhubung ke server. Periksa koneksi Wi-Fi Anda.';
      return { success: false, message };
    }
  };

  /**
   * Sinkronisasi data profil user terbaru dari server
   */
  const refreshProfile = async () => {
    try {
      const response = await fetchProfile();
      if (response.success) {
        setUser(response.data);
        await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.data));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired — paksa logout agar user login ulang
        await logout();
      }
    }
  };

  /**
   * Proses logout — hapus semua sesi dari storage dan reset state
   */
  const logout = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY_TOKEN, STORAGE_KEY_USER]);
    setToken(null);
    setUser(null);
  };

  // Muat sesi tersimpan sekali saat app pertama dibuka
  useEffect(() => {
    loadStoredSession();
  }, [loadStoredSession]);

  const contextValue = {
    user,
    token,
    isLoggedIn,
    isAdmin,
    isLoadingSession,
    login,
    register,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook untuk mengakses auth context dari komponen mana saja.
 * Akan throw error jika digunakan di luar AuthProvider (mencegah misuse).
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
}
