const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function seedAdmin() {
  try {
    const name = 'Admin Utama';
    const email = 'admin@elibrary.com';
    const password = 'admin123';
    
    console.log(`Mengecek ketersediaan akun admin dengan email: ${email}...`);
    
    // Cek apakah email sudah ada
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('✅ Akun admin sudah ada di database!');
      console.log(`Gunakan Email: ${email} dan Password: ${password} untuk login.`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert ke database
    const queryText = `
      INSERT INTO users (name, email, password, role, status)
      VALUES ($1, $2, $3, 'admin', 'active')
      RETURNING id, name, email, role
    `;
    const result = await db.query(queryText, [name, email, hashedPassword]);
    
    console.log('✅ Berhasil membuat akun Admin!');
    console.log('---------------------------------');
    console.log(`Email    : ${result.rows[0].email}`);
    console.log(`Password : ${password}`);
    console.log('---------------------------------');
    console.log('Gunakan kredensial ini untuk login di aplikasi mobile.');
    
  } catch (error) {
    console.error('❌ Gagal membuat admin:', error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
