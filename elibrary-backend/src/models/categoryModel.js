const db = require('../config/db');

// Mengambil semua kategori
const getAllCategories = async () => {
  const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

// Mengambil satu kategori berdasarkan ID
const getCategoryById = async (id) => {
  const result = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0];
};

// Membuat kategori baru
const createCategory = async (name) => {
  const result = await db.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

// Mengupdate nama kategori
const updateCategory = async (id, name) => {
  const result = await db.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0];
};

// Menghapus kategori
const deleteCategory = async (id) => {
  const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};