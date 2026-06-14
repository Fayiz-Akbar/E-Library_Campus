// src/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// 1. IMPORT MIDDLEWARE PROTEKSI 
// Catatan: Sesuaikan nama file & fungsi ekspor dengan yang dibuat temanmu ya!
const { verifyToken } = require('../middlewares/authMiddleware'); 
const { isAdmin } = require('../middlewares/adminMiddleware');

// --- RUTE PUBLIC / MAHASISWA (Siapa saja boleh akses) ---
router.get('/', bookController.getAll);
router.get('/:id', bookController.getById);

// --- RUTE PRIVAT / KHUSUS ADMIN (Wajib bawa Token JWT & Ber-role Admin) ---
router.get('/stats', [verifyToken, isAdmin], bookController.getStats); // Dikunci agar mahasiswa gak bisa intip statistik
router.post('/', [verifyToken, isAdmin], bookController.create);
router.put('/:id', [verifyToken, isAdmin], bookController.update);
router.delete('/:id', [verifyToken, isAdmin], bookController.remove);

module.exports = router;