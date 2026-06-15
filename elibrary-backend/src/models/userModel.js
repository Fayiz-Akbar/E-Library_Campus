// src/models/userModel.js
const db = require('../config/db');

/**
 * Membuat user baru di database
 * @param {Object} userData - { name, email, password (sudah di-hash), role }
 */
const createUser = async ({ name, email, password, role = 'student' }) => {
  const queryText = `
    INSERT INTO users (name, email, password, role, status)
    VALUES ($1, $2, $3, $4, 'active')
    RETURNING id, name, email, role, status, created_at
  `;
  const result = await db.query(queryText, [name, email, password, role]);
  return result.rows[0];
};

/**
 * Mencari user berdasarkan email (untuk login & cek duplikasi)
 * Mengembalikan data lengkap termasuk password hash untuk verifikasi
 */
const findByEmail = async (email) => {
  const queryText = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(queryText, [email]);
  return result.rows[0];
};

/**
 * Mencari user berdasarkan ID (untuk profil & verifikasi token)
 * Tidak mengembalikan password demi keamanan
 */
const findById = async (id) => {
  const queryText = `
    SELECT id, name, email, role, status, created_at, updated_at
    FROM users WHERE id = $1
  `;
  const result = await db.query(queryText, [id]);
  return result.rows[0];
};

/**
 * Mengupdate data profil user (nama & email)
 */
const updateProfile = async (id, { name, email }) => {
  const queryText = `
    UPDATE users
    SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, email, role, status, created_at, updated_at
  `;
  const result = await db.query(queryText, [name, email, id]);
  return result.rows[0];
};

/**
 * Mengambil semua user dengan fitur pencarian (untuk admin)
 * @param {string} search - Kata kunci pencarian nama/email
 */
const getAllUsers = async (search) => {
  let queryText = `
    SELECT id, name, email, role, status, created_at, updated_at
    FROM users WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (search) {
    queryText += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await db.query(queryText, params);
  return result.rows;
};

/**
 * Toggle status user antara 'active' dan 'suspended'
 */
const updateUserStatus = async (id, status) => {
  const queryText = `
    UPDATE users
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, name, email, role, status, created_at, updated_at
  `;
  const result = await db.query(queryText, [status, id]);
  return result.rows[0];
};

/**
 * Update role user (student/admin)
 */
const updateUserRole = async (id, role) => {
  const queryText = `
    UPDATE users
    SET role = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, name, email, role, status, created_at, updated_at
  `;
  const result = await db.query(queryText, [role, id]);
  return result.rows[0];
};

/**
 * Statistik user untuk dashboard admin
 */
const getUserStatistics = async () => {
  const queryText = `
    SELECT
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE status = 'active') as active_users,
      COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
      COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
      COUNT(*) FILTER (WHERE role = 'student') as student_count
    FROM users
  `;
  const result = await db.query(queryText);
  return result.rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  updateProfile,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getUserStatistics,
};
