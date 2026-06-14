// src/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// 🛠️ TEMPORARY DUMMY MIDDLEWARES
// Kita buat fungsi palsu di sini agar Express tidak crash mencari file Person A.
// Begitu Person A sudah menyelesaikan tugasnya, tinggal ganti baris ini dengan require asli.
const verifyToken = (req, res, next) => {
  console.log('--- Bypass Verification Token (Dev Mode) ---');
  next(); 
};

const isAdmin = (req, res, next) => {
  console.log('--- Bypass Validation Admin Role (Dev Mode) ---');
  next(); 
};

// --- RUTE PUBLIC / MAHASISWA ---
router.get('/', bookController.getAll);
router.get('/:id', bookController.getById);

// --- RUTE PRIVAT / KHUSUS ADMIN ---
router.get('/stats', [verifyToken, isAdmin], bookController.getStats);
router.post('/', [verifyToken, isAdmin], bookController.create);
router.put('/:id', [verifyToken, isAdmin], bookController.update);
router.delete('/:id', [verifyToken, isAdmin], bookController.remove);

module.exports = router;