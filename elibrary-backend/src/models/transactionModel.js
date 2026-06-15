const db = require('../config/db');
const { calculateFine } = require('../utils/calculateFine');

const ACTIVE_TRANSACTION_STATUSES = ['borrowed', 'overdue'];
const DEFAULT_BORROW_DAYS = 7;

const parsePositiveInteger = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseBookIdFromQrCode = (qrCode) => {
  if (!qrCode || typeof qrCode !== 'string') return null;

  const trimmed = qrCode.trim();
  const numericId = parsePositiveInteger(trimmed);
  if (numericId) return numericId;

  try {
    const payload = JSON.parse(trimmed);
    return parsePositiveInteger(payload.id || payload.book_id || payload.bookId);
  } catch (error) {
    return null;
  }
};

const findBookForTransaction = async (client, { bookId, qrCode }) => {
  const parsedBookId = parsePositiveInteger(bookId) || parseBookIdFromQrCode(qrCode);

  if (parsedBookId) {
    const result = await client.query(
      'SELECT * FROM books WHERE id = $1 FOR UPDATE',
      [parsedBookId]
    );
    return result.rows[0];
  }

  if (qrCode) {
    const result = await client.query(
      'SELECT * FROM books WHERE qr_code = $1 FOR UPDATE',
      [qrCode]
    );
    return result.rows[0];
  }

  return null;
};

const findUserById = async (client, userId) => {
  const result = await client.query(
    'SELECT id, name, email, role, status FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

const findActiveTransactionForUpdate = async (client, userId, bookId) => {
  const result = await client.query(
    `
      SELECT *
      FROM transactions
      WHERE user_id = $1
        AND book_id = $2
        AND status = ANY($3)
      ORDER BY borrow_date DESC
      LIMIT 1
      FOR UPDATE
    `,
    [userId, bookId, ACTIVE_TRANSACTION_STATUSES]
  );
  return result.rows[0];
};

const enrichTransactionResult = async (client, transactionId) => {
  const result = await client.query(
    `
      SELECT
        t.*,
        u.name AS user_name,
        u.email AS user_email,
        b.title AS book_title,
        b.author AS book_author,
        b.cover_image AS book_cover_image,
        b.available_stock AS book_available_stock
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      JOIN books b ON b.id = t.book_id
      WHERE t.id = $1
    `,
    [transactionId]
  );
  return result.rows[0];
};

const borrowBook = async ({ userId, bookId, qrCode }) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const user = await findUserById(client, userId);
    if (!user) {
      const error = new Error('Data user tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Akun Anda sedang tidak aktif dan tidak dapat meminjam buku.');
      error.statusCode = 403;
      throw error;
    }

    const book = await findBookForTransaction(client, { bookId, qrCode });
    if (!book) {
      const error = new Error('Buku tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (Number(book.available_stock) <= 0) {
      const error = new Error('Stok buku tidak tersedia untuk dipinjam.');
      error.statusCode = 409;
      throw error;
    }

    const activeTransaction = await findActiveTransactionForUpdate(client, userId, book.id);
    if (activeTransaction) {
      const error = new Error('Anda masih memiliki transaksi aktif untuk buku ini.');
      error.statusCode = 409;
      throw error;
    }

    const transactionResult = await client.query(
      `
        INSERT INTO transactions (user_id, book_id, due_date, status)
        VALUES ($1, $2, CURRENT_TIMESTAMP + ($3 * INTERVAL '1 day'), 'borrowed')
        RETURNING *
      `,
      [userId, book.id, DEFAULT_BORROW_DAYS]
    );

    const updatedBookResult = await client.query(
      `
        UPDATE books
        SET available_stock = available_stock - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      [book.id]
    );

    const transaction = await enrichTransactionResult(client, transactionResult.rows[0].id);

    await client.query('COMMIT');

    return {
      transaction,
      book: updatedBookResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const returnBook = async ({ userId, bookId, qrCode }) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const user = await findUserById(client, userId);
    if (!user) {
      const error = new Error('Data user tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Akun Anda sedang tidak aktif dan tidak dapat mengembalikan buku.');
      error.statusCode = 403;
      throw error;
    }

    const book = await findBookForTransaction(client, { bookId, qrCode });
    if (!book) {
      const error = new Error('Buku tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const activeTransaction = await findActiveTransactionForUpdate(client, userId, book.id);
    if (!activeTransaction) {
      const error = new Error('Tidak ada transaksi aktif untuk buku ini.');
      error.statusCode = 404;
      throw error;
    }

    const returnedAt = new Date();
    const fine = calculateFine(activeTransaction.due_date, returnedAt);

    const transactionResult = await client.query(
      `
        UPDATE transactions
        SET return_date = CURRENT_TIMESTAMP,
            fine_amount = $1,
            status = 'returned',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `,
      [fine.fineAmount, activeTransaction.id]
    );

    const updatedBookResult = await client.query(
      `
        UPDATE books
        SET available_stock = LEAST(stock, available_stock + 1),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `,
      [book.id]
    );

    const transaction = await enrichTransactionResult(client, transactionResult.rows[0].id);

    await client.query('COMMIT');

    return {
      transaction,
      book: updatedBookResult.rows[0],
      fine,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getUserHistory = async ({ requestedUserId, requester }) => {
  const requesterId = parsePositiveInteger(requester.id);
  const targetUserId = parsePositiveInteger(requestedUserId);

  if (!targetUserId) {
    const error = new Error('User ID tidak valid.');
    error.statusCode = 400;
    throw error;
  }

  if (requester.role !== 'admin' && requesterId !== targetUserId) {
    const error = new Error('Anda hanya dapat melihat riwayat peminjaman milik akun sendiri.');
    error.statusCode = 403;
    throw error;
  }

  const result = await db.query(
    `
      SELECT
        t.*,
        b.title,
        b.author,
        b.cover_image,
        b.publisher,
        b.isbn
      FROM transactions t
      JOIN books b ON b.id = t.book_id
      WHERE t.user_id = $1
      ORDER BY t.borrow_date DESC
    `,
    [targetUserId]
  );

  return result.rows;
};

const getTransactionStatistics = async () => {
  const result = await db.query(
    `
      SELECT
        COUNT(*) FILTER (WHERE status = 'borrowed') AS active_transactions,
        COUNT(*) FILTER (
          WHERE status = 'overdue'
             OR (status = 'borrowed' AND due_date < CURRENT_TIMESTAMP)
        ) AS overdue_transactions,
        COUNT(*) FILTER (WHERE status = 'returned') AS returned_transactions,
        COALESCE(SUM(fine_amount), 0) AS total_fines
      FROM transactions
    `
  );

  return result.rows[0];
};

module.exports = {
  borrowBook,
  returnBook,
  getUserHistory,
  getTransactionStatistics,
};
