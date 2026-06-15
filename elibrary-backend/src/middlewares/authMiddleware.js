// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia_jwt_kamu';

/**
 * Middleware untuk memverifikasi JWT token dari header Authorization.
 * Menyisipkan data user yang terdekripsi ke req.user agar bisa dipakai
 * oleh controller berikutnya di chain middleware.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Sisipkan data user ke request agar controller bisa mengakses
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    // Bedakan antara token kadaluarsa dan token yang invalid
    const isExpired = error.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired
        ? 'Sesi login telah kedaluwarsa. Silakan login ulang.'
        : 'Token tidak valid. Silakan login ulang.',
    });
  }
};

module.exports = { verifyToken };
