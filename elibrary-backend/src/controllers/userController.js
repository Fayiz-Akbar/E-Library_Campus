// src/controllers/userController.js
const userModel = require('../models/userModel');

/**
 * GET /api/users
 * Mengambil daftar semua user (admin only) dengan fitur pencarian
 */
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const users = await userModel.getAllUsers(search);

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar anggota perpustakaan.',
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar anggota: ' + error.message,
    });
  }
};

/**
 * PUT /api/users/:id/status
 * Toggle status user antara active dan suspended
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Cegah admin menonaktifkan dirinya sendiri
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengubah status akun Anda sendiri.',
      });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Anggota tidak ditemukan.',
      });
    }

    // Toggle: active → suspended, suspended → active
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const updatedUser = await userModel.updateUserStatus(id, newStatus);

    return res.status(200).json({
      success: true,
      message: `Status anggota berhasil diubah menjadi "${newStatus}".`,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah status anggota: ' + error.message,
    });
  }
};

/**
 * PUT /api/users/:id/role
 * Mengubah role user (student ↔ admin)
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validasi role yang diperbolehkan
    const ALLOWED_ROLES = ['student', 'admin'];
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Role tidak valid. Gunakan salah satu: ${ALLOWED_ROLES.join(', ')}`,
      });
    }

    // Cegah admin mengubah role dirinya sendiri
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengubah role akun Anda sendiri.',
      });
    }

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Anggota tidak ditemukan.',
      });
    }

    const updatedUser = await userModel.updateUserRole(id, role);

    return res.status(200).json({
      success: true,
      message: `Role anggota berhasil diubah menjadi "${role}".`,
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah role anggota: ' + error.message,
    });
  }
};

/**
 * GET /api/users/stats
 * Statistik anggota perpustakaan (untuk dashboard admin)
 */
const getUserStats = async (req, res) => {
  try {
    const stats = await userModel.getUserStatistics();

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil statistik anggota.',
      data: {
        total_users: parseInt(stats.total_users) || 0,
        active_users: parseInt(stats.active_users) || 0,
        suspended_users: parseInt(stats.suspended_users) || 0,
        admin_count: parseInt(stats.admin_count) || 0,
        student_count: parseInt(stats.student_count) || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik anggota: ' + error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  updateUserRole,
  getUserStats,
};
