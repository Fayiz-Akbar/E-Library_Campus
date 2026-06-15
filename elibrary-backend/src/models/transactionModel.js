const db = require('../config/db');
const { calculateFine } = require('../utils/calculateFine');

const ACTIVE_TRANSACTION_STATUSES = ['borrowed', 'overdue'];
const DEFAULT_BORROW_DAYS = 7;
const HISTORY_STATUSES = ['borrowed', 'returned', 'overdue', 'lost', 'damaged'];
const ADMIN_TRANSACTION_STATUSES = ['borrowed', 'returned', 'overdue', 'lost', 'damaged'];
const OVERRIDE_STATUSES = ['returned', 'lost', 'damaged'];
const DUE_SOON_DAYS = 2;

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

const getDisplayStatusSql = () => `
  CASE
    WHEN t.status IN ('borrowed', 'overdue') AND t.due_date < CURRENT_TIMESTAMP THEN 'overdue'
    ELSE t.status
  END
`;

const buildHistoryStatusFilter = (status) => {
  if (!status) {
    return { clause: '', values: [] };
  }

  if (!HISTORY_STATUSES.includes(status)) {
    const error = new Error('Status riwayat tidak valid.');
    error.statusCode = 400;
    throw error;
  }

  if (status === 'overdue') {
    return {
      clause: `AND (${getDisplayStatusSql()}) = $2`,
      values: [status],
    };
  }

  if (status === 'borrowed') {
    return {
      clause: `AND (${getDisplayStatusSql()}) = $2`,
      values: [status],
    };
  }

  return {
    clause: 'AND t.status = $2',
    values: [status],
  };
};

const ensureValidDate = (value, fieldName) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`${fieldName} tidak valid.`);
    error.statusCode = 400;
    throw error;
  }
  return value;
};

const formatDateOnly = (date) => date.toISOString().slice(0, 10);

const getDefaultReportPeriod = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: formatDateOnly(start),
    endDate: formatDateOnly(end),
  };
};

const normalizeReportPeriod = (filters = {}) => {
  const defaults = getDefaultReportPeriod();
  const rawStartDate = filters.start_date || filters.startDate || defaults.startDate;
  const rawEndDate = filters.end_date || filters.endDate || defaults.endDate;
  const startDate = ensureValidDate(rawStartDate, 'Tanggal mulai');
  const endDate = ensureValidDate(rawEndDate, 'Tanggal akhir');

  if (new Date(startDate) > new Date(endDate)) {
    const error = new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir.');
    error.statusCode = 400;
    throw error;
  }

  return { startDate, endDate };
};

const getUserHistory = async ({ requestedUserId, requester, status }) => {
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

  const statusFilter = buildHistoryStatusFilter(status);
  const queryValues = [targetUserId, ...statusFilter.values];

  const result = await db.query(
    `
      SELECT
        t.id,
        t.user_id,
        t.book_id,
        t.borrow_date,
        t.due_date,
        t.return_date,
        t.fine_amount,
        ${getDisplayStatusSql()} AS status,
        t.status AS raw_status,
        t.created_at,
        t.updated_at,
        b.title,
        b.author,
        b.cover_image,
        b.publisher,
        b.isbn
      FROM transactions t
      JOIN books b ON b.id = t.book_id
      WHERE t.user_id = $1
      ${statusFilter.clause}
      ORDER BY t.borrow_date DESC
    `,
    queryValues
  );

  return result.rows;
};

const getUserDueNotifications = async ({ requester }) => {
  const requesterId = parsePositiveInteger(requester.id);

  if (!requesterId) {
    const error = new Error('User ID tidak valid.');
    error.statusCode = 400;
    throw error;
  }

  const result = await db.query(
    `
      SELECT
        t.id,
        t.user_id,
        t.book_id,
        t.borrow_date,
        t.due_date,
        t.return_date,
        t.fine_amount,
        ${getDisplayStatusSql()} AS status,
        t.status AS raw_status,
        b.title,
        b.author,
        b.cover_image,
        b.publisher,
        b.isbn
      FROM transactions t
      JOIN books b ON b.id = t.book_id
      WHERE t.user_id = $1
        AND t.status = ANY($2)
        AND t.due_date <= CURRENT_TIMESTAMP + ($3 * INTERVAL '1 day')
      ORDER BY t.due_date ASC
    `,
    [requesterId, ACTIVE_TRANSACTION_STATUSES, DUE_SOON_DAYS]
  );

  const now = new Date();

  return result.rows.map((transaction) => {
    const dueDate = new Date(transaction.due_date);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const fine = calculateFine(transaction.due_date, now);
    const isOverdue = transaction.status === 'overdue';

    return {
      ...transaction,
      notification_type: isOverdue ? 'overdue' : 'due_soon',
      days_until_due: diffDays,
      late_days: fine.lateDays,
      estimated_fine_amount: fine.fineAmount,
    };
  });
};

const getAllTransactions = async ({ filters = {} } = {}) => {
  const {
    status,
    user_id,
    userId,
    book_id,
    bookId,
    start_date,
    startDate,
    end_date,
    endDate,
    search,
  } = filters;

  const clauses = [];
  const values = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    if (!ADMIN_TRANSACTION_STATUSES.includes(status)) {
      const error = new Error('Status transaksi tidak valid.');
      error.statusCode = 400;
      throw error;
    }

    clauses.push(`(${getDisplayStatusSql()}) = $${paramIndex}`);
    values.push(status);
    paramIndex += 1;
  }

  const filteredUserId = parsePositiveInteger(user_id || userId);
  if (user_id || userId) {
    if (!filteredUserId) {
      const error = new Error('User ID tidak valid.');
      error.statusCode = 400;
      throw error;
    }

    clauses.push(`t.user_id = $${paramIndex}`);
    values.push(filteredUserId);
    paramIndex += 1;
  }

  const filteredBookId = parsePositiveInteger(book_id || bookId);
  if (book_id || bookId) {
    if (!filteredBookId) {
      const error = new Error('Book ID tidak valid.');
      error.statusCode = 400;
      throw error;
    }

    clauses.push(`t.book_id = $${paramIndex}`);
    values.push(filteredBookId);
    paramIndex += 1;
  }

  const validStartDate = ensureValidDate(start_date || startDate, 'Tanggal mulai');
  if (validStartDate) {
    clauses.push(`t.borrow_date >= $${paramIndex}`);
    values.push(validStartDate);
    paramIndex += 1;
  }

  const validEndDate = ensureValidDate(end_date || endDate, 'Tanggal akhir');
  if (validEndDate) {
    clauses.push(`t.borrow_date < ($${paramIndex}::date + INTERVAL '1 day')`);
    values.push(validEndDate);
    paramIndex += 1;
  }

  if (search) {
    clauses.push(`(u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR b.title ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex += 1;
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const result = await db.query(
    `
      SELECT
        t.id,
        t.user_id,
        u.name AS user_name,
        u.email AS user_email,
        t.book_id,
        b.title AS book_title,
        b.author AS book_author,
        b.cover_image AS book_cover_image,
        t.borrow_date,
        t.due_date,
        t.return_date,
        t.fine_amount,
        ${getDisplayStatusSql()} AS status,
        t.status AS raw_status,
        t.override_note,
        t.overridden_at,
        t.overridden_by,
        admin.name AS overridden_by_name,
        t.created_at,
        t.updated_at
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      JOIN books b ON b.id = t.book_id
      LEFT JOIN users admin ON admin.id = t.overridden_by
      ${whereClause}
      ORDER BY t.borrow_date DESC
    `,
    values
  );

  return result.rows;
};

const getTransactionReport = async ({ filters = {} } = {}) => {
  const { startDate, endDate } = normalizeReportPeriod(filters);

  const result = await db.query(
    `
      SELECT
        t.id AS transaction_id,
        t.user_id,
        u.name AS student_name,
        u.email AS student_email,
        t.book_id,
        b.title AS book_title,
        b.author AS book_author,
        t.borrow_date,
        t.due_date,
        t.return_date,
        ${getDisplayStatusSql()} AS status,
        t.status AS raw_status,
        COALESCE(t.fine_amount, 0) AS fine_amount
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      JOIN books b ON b.id = t.book_id
      WHERE t.borrow_date >= $1::date
        AND t.borrow_date < ($2::date + INTERVAL '1 day')
      ORDER BY t.borrow_date DESC
    `,
    [startDate, endDate]
  );

  const items = result.rows;
  const summary = items.reduce((acc, item) => {
    acc.total_transactions += 1;
    acc.total_fines += Number(item.fine_amount) || 0;

    if (item.status === 'borrowed') acc.borrowed += 1;
    if (item.status === 'returned') acc.returned += 1;
    if (item.status === 'overdue') acc.overdue += 1;
    if (item.status === 'lost') acc.lost += 1;
    if (item.status === 'damaged') acc.damaged += 1;

    return acc;
  }, {
    total_transactions: 0,
    borrowed: 0,
    returned: 0,
    overdue: 0,
    lost: 0,
    damaged: 0,
    total_fines: 0,
  });

  return {
    period: {
      start_date: startDate,
      end_date: endDate,
    },
    summary,
    items,
  };
};

const overrideTransactionStatus = async ({ transactionId, adminId, status, note }) => {
  const parsedTransactionId = parsePositiveInteger(transactionId);
  const parsedAdminId = parsePositiveInteger(adminId);

  if (!parsedTransactionId) {
    const error = new Error('Transaction ID tidak valid.');
    error.statusCode = 400;
    throw error;
  }

  if (!OVERRIDE_STATUSES.includes(status)) {
    const error = new Error('Status override tidak valid.');
    error.statusCode = 400;
    throw error;
  }

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const transactionResult = await client.query(
      `
        SELECT *
        FROM transactions
        WHERE id = $1
        FOR UPDATE
      `,
      [parsedTransactionId]
    );
    const existingTransaction = transactionResult.rows[0];

    if (!existingTransaction) {
      const error = new Error('Transaksi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const shouldRestoreStock = status === 'returned'
      && !existingTransaction.return_date
      && ACTIVE_TRANSACTION_STATUSES.includes(existingTransaction.status);

    if (shouldRestoreStock) {
      await client.query(
        `
          UPDATE books
          SET available_stock = LEAST(stock, available_stock + 1),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [existingTransaction.book_id]
      );
    }

    const returnedAtSql = status === 'returned' ? 'COALESCE(return_date, CURRENT_TIMESTAMP)' : 'return_date';
    const updatedResult = await client.query(
      `
        UPDATE transactions
        SET status = $1,
            return_date = ${returnedAtSql},
            override_note = $2,
            overridden_at = CURRENT_TIMESTAMP,
            overridden_by = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `,
      [status, note || null, parsedAdminId, parsedTransactionId]
    );

    const enriched = await enrichTransactionResult(client, updatedResult.rows[0].id);

    await client.query('COMMIT');

    return {
      transaction: {
        ...enriched,
        override_note: updatedResult.rows[0].override_note,
        overridden_at: updatedResult.rows[0].overridden_at,
        overridden_by: updatedResult.rows[0].overridden_by,
      },
      stock_restored: shouldRestoreStock,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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
  getUserDueNotifications,
  getAllTransactions,
  getTransactionReport,
  overrideTransactionStatus,
  getTransactionStatistics,
};
