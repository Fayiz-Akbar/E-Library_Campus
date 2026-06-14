require('dotenv').config();
const express = require('express');
const { initDatabase } = require('./src/config/db'); // Import inisialisasi DB

const app = express();
app.use(express.json());

// Jalankan inisialisasi tabel database
initDatabase();

app.get('/', (req, res) => res.json({ message: 'E-Library API berjalan!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));