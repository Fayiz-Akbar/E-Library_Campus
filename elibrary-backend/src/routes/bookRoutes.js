// src/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');


// --- RUTE PUBLIC / MAHASISWA ---
router.get('/', bookController.getAll);
router.get('/:id', bookController.getById);

// --- RUTE PRIVAT / KHUSUS ADMIN ---
router.get('/stats', [verifyToken, isAdmin], bookController.getStats);
router.post('/', [verifyToken, isAdmin], bookController.create);
router.put('/:id', [verifyToken, isAdmin], bookController.update);
router.delete('/:id', [verifyToken, isAdmin], bookController.remove);

module.exports = router;