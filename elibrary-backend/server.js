const express = require('express');
const app = express();
app.use(express.json());
app.get('/', (req, res) => res.json({ message: 'E-Library API berjalan!' }));
app.listen(process.env.PORT || 3000, () => console.log('Server jalan di port 3000'));