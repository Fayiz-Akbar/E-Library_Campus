require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./src/config/db');
const categoryRoutes = require('./src/routes/categoryRoutes');
const bookRoutes = require('./src/routes/bookRoutes'); // Import rute buku

const app = express();

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Jalankan inisialisasi tabel database
initDatabase();

// Registrasi Base Route API
app.use('/api/categories', categoryRoutes);
app.use('/api/books', bookRoutes); // Registrasi rute buku ke endpoint /api/books

app.get('/', (req, res) => res.json({ message: 'E-Library API berjalan!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));