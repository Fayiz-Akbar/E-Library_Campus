const express = require('express');
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');

const router = express.Router();

router.post('/borrow', verifyToken, transactionController.borrow);
router.post('/return', verifyToken, transactionController.returnBorrowedBook);
router.get('/report', [verifyToken, isAdmin], transactionController.getTransactionReport);
router.get('/export', [verifyToken, isAdmin], transactionController.exportTransactionReport);
router.get('/', [verifyToken, isAdmin], transactionController.getAllTransactions);
router.put('/:id/override', [verifyToken, isAdmin], transactionController.overrideTransaction);
router.get('/notifications', verifyToken, transactionController.getNotifications);
router.get('/history/:user_id', verifyToken, transactionController.getHistory);
router.get('/stats', [verifyToken, isAdmin], transactionController.getStats);

module.exports = router;
