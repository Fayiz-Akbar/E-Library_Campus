const transactionModel = require('../models/transactionModel');
const { buildTransactionReportCsv } = require('../utils/exportReport');

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

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel.getAllTransactions({
      filters: req.query,
    });

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua transaksi.',
      data: transactions,
    });
  } catch (error) {
    return sendError(res, error, 'Gagal mengambil semua transaksi.');
  }
};

const overrideTransaction = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status override wajib dikirim.',
      });
    }

    const data = await transactionModel.overrideTransactionStatus({
      transactionId: req.params.id,
      adminId: req.user.id,
      status,
      note,
    });

    return res.status(200).json({
      success: true,
      message: 'Status transaksi berhasil dioverride.',
      data,
    });
  } catch (error) {
    return sendError(res, error, 'Gagal override status transaksi.');
  }
};

const getTransactionReport = async (req, res) => {
  try {
    const report = await transactionModel.getTransactionReport({
      filters: req.query,
    });

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil laporan transaksi.',
      data: report,
    });
  } catch (error) {
    return sendError(res, error, 'Gagal mengambil laporan transaksi.');
  }
};

const exportTransactionReport = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();

    if (format !== 'csv') {
      return res.status(400).json({
        success: false,
        message: 'Format export belum didukung. Gunakan format csv.',
      });
    }

    const report = await transactionModel.getTransactionReport({
      filters: req.query,
    });
    const csv = buildTransactionReportCsv(report.items);
    const filename = `transaction-report-${report.period.start_date}-to-${report.period.end_date}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    return sendError(res, error, 'Gagal export laporan transaksi.');
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
  getAllTransactions,
  overrideTransaction,
  getTransactionReport,
  exportTransactionReport,
  getStats,
};
