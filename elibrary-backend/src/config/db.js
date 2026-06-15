const { Pool } = require('pg');
require('dotenv').config();

// Konfigurasi pool koneksi PostgreSQL menggunakan Connection Pooler Supabase (Port 6543)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Diperlukan untuk koneksi aman cloud Supabase
  }
});

// Fungsi untuk menginisialisasi seluruh tabel database (Person A, B, & C)
const initDatabase = async () => {
  const queryCreateTable = `
    -- 1. TABEL USER & AUTH (Person A)
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. TABEL KATEGORI BUKU (Person B)
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. TABEL BUKU (Person B)
    CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(150) NOT NULL,
        publisher VARCHAR(150),
        isbn VARCHAR(50),
        summary TEXT,
        cover_image VARCHAR(255),
        stock INT NOT NULL DEFAULT 1,
        available_stock INT NOT NULL DEFAULT 1,
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. TABEL TRANSAKSI & QR (Person C)
    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        book_id INT REFERENCES books(id) ON DELETE CASCADE,
        borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP NOT NULL,
        return_date TIMESTAMP,
        fine_amount DECIMAL(10, 2) DEFAULT 0.00,
        status VARCHAR(20) NOT NULL DEFAULT 'borrowed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user_id
      ON transactions(user_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_book_id
      ON transactions(book_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_status
      ON transactions(status);

    CREATE INDEX IF NOT EXISTS idx_transactions_active_user_book
      ON transactions(user_id, book_id, status)
      WHERE status IN ('borrowed', 'overdue');
  `;

  try {
    await pool.query(queryCreateTable);
    console.log(' SUCCESS: Seluruh tabel E-Library (Full Schema) telah siap! ');
    console.log('   - users                                        ');
    console.log('   - categories & books                           ');
    console.log('   - transactions                                 ');
  } catch (error) {
    console.error('CRITICAL ERROR: Gagal menginisialisasi skema database penuh:', error.message);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  initDatabase,
};
