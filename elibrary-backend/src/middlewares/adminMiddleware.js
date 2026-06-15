// src/middlewares/adminMiddleware.js

/**
 * Middleware untuk memvalidasi bahwa user yang mengakses adalah admin.
 * Harus digunakan SETELAH verifyToken, karena mengandalkan req.user.role
 * yang disisipkan oleh authMiddleware.
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.',
    });
  }
  next();
};

module.exports = { isAdmin };
