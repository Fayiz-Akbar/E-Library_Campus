const db = require('../config/db');
const crypto = require('crypto'); // Built-in Node.js module untuk generate UUID

// Mengambil semua buku dengan fitur Search & Filter dinamis
const getAllBooks = async (search, categoryId) => {
  let queryText = `
    SELECT b.*, c.name as category_name 
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  // Pencarian berdasarkan judul, penulis, atau ISBN
  if (search) {
    queryText += ` AND (b.title ILIKE $${paramIndex} OR b.author ILIKE $${paramIndex} OR b.isbn ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Filter berdasarkan Kategori
  if (categoryId) {
    queryText += ` AND b.category_id = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  queryText += ' ORDER BY b.created_at DESC';

  const result = await db.query(queryText, params);
  return result.rows;
};

// Mengambil satu buku berdasarkan ID
const getBookById = async (id) => {
  const queryText = `
    SELECT b.*, c.name as category_name 
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = $1
  `;
  const result = await db.query(queryText, [id]);
  return result.rows[0];
};

// Membuat data buku baru beserta otomatis enkripsi/generate UUID untuk QR Code
const createBook = async (bookData) => {
  const { category_id, title, author, publisher, isbn, summary, cover_image, stock } = bookData;
  
  // Mengenerate string unik UUID v4 untuk scan QR Code peminjaman
  const qrCode = crypto.randomUUID(); 
  const available_stock = stock; // 

  const queryText = `
    INSERT INTO books (category_id, title, author, publisher, isbn, summary, cover_image, stock, available_stock, qr_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  
  // Variabel available_stock di bawah ini sekarang sudah sinkron dan terdefinisi
  const values = [category_id, title, author, publisher, isbn, summary, cover_image, stock, available_stock, qrCode];
  const result = await db.query(queryText, values);
  return result.rows[0];
};

// Mengupdate data buku
const updateBook = async (id, bookData) => {
  const { category_id, title, author, publisher, isbn, summary, cover_image, stock, available_stock } = bookData;
  
  const queryText = `
    UPDATE books 
    SET category_id = $1, title = $2, author = $3, publisher = $4, isbn = $5, summary = $6, cover_image = $7, stock = $8, available_stock = $9, updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *
  `;
  
  const values = [category_id, title, author, publisher, isbn, summary, cover_image, stock, available_stock, id];
  const result = await db.query(queryText, values);
  return result.rows[0];
};

// Menghapus buku
const deleteBook = async (id) => {
  const result = await db.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

// Mengambil Statistik Buku (Kebutuhan Dashboard Admin Person B)
const getBookStatistics = async () => {
  const queryText = `
    SELECT 
      COUNT(*) as total_titles,
      SUM(stock) as total_books_stock,
      SUM(available_stock) as total_available_stock
    FROM books
  `;
  const result = await db.query(queryText);
  return result.rows[0];
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookStatistics
};