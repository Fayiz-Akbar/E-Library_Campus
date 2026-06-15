// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_jwt_kamu';
const JWT_EXPIRES_IN = '7d'; // Token berlaku 7 hari

const SALT_ROUNDS = 10;

/**
 * Menghasilkan JWT token dari data user
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/register
 * Mendaftarkan akun baru ke sistem perpustakaan
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input wajib
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.',
      });
    }

    // Validasi panjang password minimum
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter.',
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
      });
    }

    // Hash password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Selamat datang di E-Library.',
      data: { user: newUser, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mendaftarkan akun: ' + error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Login ke sistem dan mendapatkan JWT token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    // Cari user berdasarkan email (termasuk hash password untuk verifikasi)
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    // Cek apakah akun sudah disuspend oleh admin
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan oleh admin. Hubungi petugas perpustakaan.',
      });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    const token = generateToken(user);

    // Kirim data user tanpa field password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal login: ' + error.message,
    });
  }
};

/**
 * GET /api/auth/profile
 * Mengambil data profil user yang sedang login (butuh verifyToken)
 */
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Data profil tidak ditemukan.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data profil.',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil profil: ' + error.message,
    });
  }
};

/**
 * PUT /api/auth/profile
 * Mengupdate data profil user yang sedang login
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nama dan email wajib diisi.',
      });
    }

    // Cek apakah email baru sudah dipakai user lain
    const existingUser = await userModel.findByEmail(email);
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah digunakan oleh akun lain.',
      });
    }

    const updatedUser = await userModel.updateProfile(req.user.id, { name, email });

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil: ' + error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
