// src/controllers/bookController.js
const bookModel = require('../models/bookModel');
const db = require('../config/db'); // 🚀 TAMBAHKAN: Import db pool langsung untuk cek transaksi relasi
const { generateBookQR } = require('../utils/generateQRCode'); 

// GET /api/books (Mendukung /api/books?search=...&category=...)
const getAll = async (req, res) => {
  try {
    const { search, category } = req.query;
    const books = await bookModel.getAllBooks(search, category);
    
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar katalog buku',
      data: books,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar buku: ' + error.message,
    });
  }
};

// GET /api/books/stats
const getStats = async (req, res) => {
  try {
    const stats = await bookModel.getBookStatistics();
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil statistik data buku',
      data: {
        total_titles: parseInt(stats.total_titles) || 0,
        total_books_stock: parseInt(stats.total_books_stock) || 0,
        total_available_stock: parseInt(stats.total_available_stock) || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik buku: ' + error.message,
    });
  }
};

// GET /api/books/:id
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await bookModel.getBookById(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Buku tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail buku',
      data: book,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail buku: ' + error.message,
    });
  }
};

// POST /api/books
const create = async (req, res) => {
  try {
    const { category_id, title, author, publisher, isbn, summary, cover_image, stock } = req.body;
    
    if (!title || !author || !stock) {
      return res.status(400).json({
        success: false,
        message: 'Kolom judul (title), penulis (author), dan jumlah stok wajib diisi',
      });
    }

    const newBook = await bookModel.createBook({
      category_id: category_id || null,
      title,
      author,
      publisher,
      isbn,
      summary,
      cover_image,
      stock: parseInt(stock) || 1,
      available_stock: parseInt(stock) || 1
    });

    const qrCodeData = await generateBookQR(newBook.id);

    const finalBook = await bookModel.updateBook(newBook.id, {
      category_id: category_id || null,
      title: title,
      author: author,
      publisher: publisher || '',
      isbn: isbn || '',
      summary: summary || '',
      cover_image: cover_image || '',
      stock: parseInt(stock) || 1,
      available_stock: parseInt(stock) || 1, 
      qr_code: qrCodeData 
    });

    return res.status(201).json({
      success: true,
      message: 'Buku baru berhasil didaftarkan dan QR Code token tercipta',
      data: finalBook,
    });
  } catch (error) {
    console.error("EROR ASLI NYA INI BREE ➔", error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan buku baru: ' + error.message,
    });
  }
};

// PUT /api/books/:id
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, title, author, publisher, isbn, summary, cover_image, stock, available_stock } = req.body;

    const existingBook = await bookModel.getBookById(id);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Buku tidak ditemukan',
      });
    }

    const updatedBook = await bookModel.updateBook(id, {
      category_id: category_id || existingBook.category_id,
      title: title || existingBook.title,
      author: author || existingBook.author,
      publisher: publisher || existingBook.publisher,
      isbn: isbn || existingBook.isbn,
      summary: summary || existingBook.summary,
      cover_image: cover_image || existingBook.cover_image,
      stock: stock !== undefined ? parseInt(stock) : existingBook.stock,
      available_stock: available_stock !== undefined ? parseInt(available_stock) : existingBook.available_stock,
    });

    return res.status(200).json({
      success: true,
      message: 'Data buku berhasil diperbarui',
      data: updatedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data buku: ' + error.message,
    });
  }
};

// DELETE /api/books/:id
// 🚀 PERBAIKAN UTAMA: Sistem Proteksi Integrity Constraint Sebelum Menghapus Buku
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. CEK LOGIKA BISNIS: Apakah ada mahasiswa yang saat ini sedang meminjam buku ini?
    const activeTxCheck = await db.query(
      `SELECT id FROM transactions WHERE book_id = $1 AND status IN ('borrowed', 'overdue') LIMIT 1`,
      [id]
    );

    if (activeTxCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Gagal menghapus! Buku ini tidak boleh dimusnahkan karena sedang aktif dipinjam oleh mahasiswa.',
      });
    }

    // 2. CEK RELASI RIWAYAT: Bersihkan data riwayat transaksi lama yang sudah berstatus 'returned'/'lost'/'damaged'
    // Tindakan ini mencegah terjadinya eror 'foreign_key_violation' (Error 23503) dari PostgreSQL Supabase
    await db.query(`DELETE FROM transactions WHERE book_id = $1`, [id]);

    // 3. Eksekusi fungsi hapus utama dari model
    const deletedBook = await bookModel.deleteBook(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Buku tidak ditemukan atau sudah pernah dihapus sebelumnya.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Buku berhasil dimusnahkan secara permanen dari pangkalan data sistem.',
      data: deletedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data buku dari server: ' + error.message,
    });
  }
};

module.exports = {
  getAll,
  getStats,
  getById,
  create,
  update,
  remove,
};