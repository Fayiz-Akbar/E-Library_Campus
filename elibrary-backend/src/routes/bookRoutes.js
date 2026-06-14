const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Mapping endpoint
router.get('/', bookController.getAll);
router.get('/stats', bookController.getStats); // Harus di atas /:id
router.get('/:id', bookController.getById);
router.post('/', bookController.create);
router.put('/:id', bookController.update);
router.delete('/:id', bookController.remove);

module.exports = router;