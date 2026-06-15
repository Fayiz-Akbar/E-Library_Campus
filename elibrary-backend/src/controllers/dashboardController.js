const userModel = require('../models/userModel');
const bookModel = require('../models/bookModel');
const transactionModel = require('../models/transactionModel');

const emptyUserStats = {
  total_users: 0,
  active_users: 0,
  suspended_users: 0,
  admin_count: 0,
  student_count: 0,
};

const emptyBookStats = {
  total_titles: 0,
  total_books_stock: 0,
  total_available_stock: 0,
};

const emptyTransactionStats = {
  active_transactions: 0,
  overdue_transactions: 0,
  returned_transactions: 0,
  total_fines: 0,
};

const parseInteger = (value) => parseInt(value, 10) || 0;
const parseMoney = (value) => parseFloat(value) || 0;

const safeResolve = async (resolver, fallback) => {
  try {
    return {
      data: await resolver(),
      error: null,
    };
  } catch (error) {
    return {
      data: fallback,
      error: error.message,
    };
  }
};

const getAdminDashboard = async (req, res) => {
  const [usersResult, booksResult, transactionsResult] = await Promise.all([
    safeResolve(userModel.getUserStatistics, emptyUserStats),
    safeResolve(bookModel.getBookStatistics, emptyBookStats),
    safeResolve(transactionModel.getTransactionStatistics, emptyTransactionStats),
  ]);

  const users = usersResult.data || emptyUserStats;
  const books = booksResult.data || emptyBookStats;
  const transactions = transactionsResult.data || emptyTransactionStats;

  return res.status(200).json({
    success: true,
    message: 'Berhasil mengambil dashboard admin.',
    data: {
      users: {
        total_users: parseInteger(users.total_users),
        active_users: parseInteger(users.active_users),
        suspended_users: parseInteger(users.suspended_users),
        admin_count: parseInteger(users.admin_count),
        student_count: parseInteger(users.student_count),
      },
      books: {
        total_titles: parseInteger(books.total_titles),
        total_books_stock: parseInteger(books.total_books_stock),
        total_available_stock: parseInteger(books.total_available_stock),
      },
      transactions: {
        active_transactions: parseInteger(transactions.active_transactions),
        overdue_transactions: parseInteger(transactions.overdue_transactions),
        returned_transactions: parseInteger(transactions.returned_transactions),
        total_fines: parseMoney(transactions.total_fines),
      },
      warnings: {
        users: usersResult.error,
        books: booksResult.error,
        transactions: transactionsResult.error,
      },
    },
  });
};

module.exports = {
  getAdminDashboard,
};
