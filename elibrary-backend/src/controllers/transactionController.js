const transactionModel = require('../models/transactionModel');

const getErrorStatusCode = (error) => error.statusCode || 500;

const sendError = (res, error, fallbackMessage) => res.status(getErrorStatusCode(error)).json({
  success: false,
  message: error.message || fallbackMessage,
});

const borrow = async (req, res) => {
  try {
    const { book_id, bookId, qr_code, qrCode } = req.body;

    if (!book_id && !bookId && !qr_code && !qrCode) {
      return res.status(400).json({
        success: false,
        message: 'book_id atau qr_code wajib dikirim.',
      });
    }

    const data = await transactionModel.borrowBook({
      userId: req.user.id,
      bookId: book_id || bookId,
      qrCode: qr_code || qrCode,
    });

    return res.status(201).json({
      success: true,
      message: 'Buku berhasil dipinjam.',
      data,
    });
  } catch (error) {
    return sendError(res, error, 'Gagal meminjam buku.');
  }
};

const returnBorrowedBook = async (req, res) => {
  try {
    const { book_id, bookId, qr_code, qrCode } = req.body;

    if (!book_id && !bookId && !qr_code && !qrCode) {
      return res.status(400).json({
        success: false,
        message: 'book_id atau qr_code wajib dikirim.',
      });
    }

    const data = await transactionModel.returnBook({
      userId: req.user.id,
      bookId: book_id || bookId,
      qrCode: qr_code || qrCode,
    });

    return res.status(200).json({
      success: true,
      message: 'Buku berhasil dikembalikan.',
      data,
    });
  } catch (error) {
    return sendError(res, error, 'Gagal mengembalikan buku.');
  }
};

const getHistory = async (req, res) => {
  try {
    const history = await transactionModel.getUserHistory({
      requestedUserId: req.params.user_id,
      requester: req.user,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil riwayat peminjaman.',
      data: history,
    });
  } catch (error) {
    return sendError(res, error, 'Gagal mengambil riwayat peminjaman.');
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await transactionModel.getUserDueNotifications({
      requester: req.user,
    });

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil notifikasi jatuh tempo.',
      data: notifications,
    });
  } catch (error) {
    return sendError(res, error, 'Gagal mengambil notifikasi jatuh tempo.');
  }
};

const getStats = async (req, res) => {
  try {
    const stats = await transactionModel.getTransactionStatistics();

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil statistik transaksi.',
      data: {
        active_transactions: parseInt(stats.active_transactions, 10) || 0,
        overdue_transactions: parseInt(stats.overdue_transactions, 10) || 0,
        returned_transactions: parseInt(stats.returned_transactions, 10) || 0,
        total_fines: parseFloat(stats.total_fines) || 0,
      },
    });
  } catch (error) {
    return sendError(res, error, 'Gagal mengambil statistik transaksi.');
  }
};

module.exports = {
  borrow,
  returnBorrowedBook,
  getHistory,
  getNotifications,
  getStats,
};
