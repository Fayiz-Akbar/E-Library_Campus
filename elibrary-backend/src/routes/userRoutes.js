// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

// Semua rute user management membutuhkan login + role admin
router.get('/stats', [verifyToken, isAdmin], userController.getUserStats);
router.get('/', [verifyToken, isAdmin], userController.getAllUsers);
router.put('/:id/status', [verifyToken, isAdmin], userController.toggleUserStatus);
router.put('/:id/role', [verifyToken, isAdmin], userController.updateUserRole);

module.exports = router;
