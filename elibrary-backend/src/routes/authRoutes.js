// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// --- RUTE PUBLIC (Tidak perlu login) ---
router.post('/register', authController.register);
router.post('/login', authController.login);

// --- RUTE PRIVAT (Harus sudah login) ---
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
