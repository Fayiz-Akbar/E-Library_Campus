const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get('/admin', [verifyToken, isAdmin], dashboardController.getAdminDashboard);

module.exports = router;
