require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Tambahan opsional yang bagus untuk komunikasi frontend-backend kedepan
const { initDatabase } = require('./src/config/db');
const categoryRoutes = require('./src/routes/categoryRoutes'); // Import rute kategori

const app = express();

app.use(cors());
app.use(express.json());

// Jalankan inisialisasi tabel database
initDatabase();

// Registrasi Base Route API untuk Kategori
app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => res.json({ message: 'E-Library API berjalan!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));