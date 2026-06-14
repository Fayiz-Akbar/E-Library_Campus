// src/controllers/bookController.js
const bookModel = require('../models/bookModel');
const { generateBookQR } = require('../utils/generateQRCode'); // <=== Import utilitas generator QR Code kita

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

// POST /api/books (Mendukung Penerbitan QR Code Otomatis)
const create = async (req, res) => {
  try {
    const { category_id, title, author, publisher, isbn, summary, cover_image, stock } = req.body;
    
    // Validasi input data krusial
    if (!title || !author || !stock) {
      return res.status(400).json({
        success: false,
        message: 'Kolom judul (title), penulis (author), dan jumlah stok wajib diisi',
      });
    }

    // 1. Simpan data buku awal ke database
    const newBook = await bookModel.createBook({
      category_id: category_id || null,
      title,
      author,
      publisher,
      isbn,
      summary,
      cover_image,
      stock: parseInt(stock) || 1
    });

    // 2. Buat data QR Code Base64 memanfaatkan ID buku yang baru terbentuk
    const qrCodeData = await generateBookQR(newBook.id);

    // 3. Update field qr_code pada buku tersebut memakai model updateBook bawaan kamu
    const finalBook = await bookModel.updateBook(newBook.id, {
      qr_code: qrCodeData
    });

    return res.status(201).json({
      success: true,
      message: 'Buku baru berhasil didaftarkan dan QR Code token tercipta',
      data: finalBook, // Kita kembalikan data finalBook yang sudah tertanam QR Code
    });
  } catch (error) {
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

    // Cek apakah buku tersebut eksis terlebih dahulu
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
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await bookModel.deleteBook(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Buku tidak ditemukan atau sudah dihapus',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Buku berhasil dihapus dari sistem',
      data: deletedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus data buku: ' + error.message,
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