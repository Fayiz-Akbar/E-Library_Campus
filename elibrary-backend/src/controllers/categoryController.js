const categoryModel = require('../models/categoryModel');

// GET /api/categories
const getAll = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua kategori',
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil kategori: ' + error.message,
    });
  }
};

// GET /api/categories/:id
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail kategori',
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kategori: ' + error.message,
    });
  }
};

// POST /api/categories
const create = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validasi input sederhana
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori wajib diisi',
      });
    }

    const newCategory = await categoryModel.createCategory(name.trim());
    return res.status(201).json({
      success: true,
      message: 'Kategori baru berhasil ditambahkan',
      data: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kategori: ' + error.message,
    });
  }
};

// PUT /api/categories/:id
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nama kategori baru wajib diisi',
      });
    }

    const updatedCategory = await categoryModel.updateCategory(id, name.trim());
    
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan atau gagal diupdate',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Kategori berhasil diubah',
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah kategori: ' + error.message,
    });
  }
};

// DELETE /api/categories/:id
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.deleteCategory(id);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Kategori tidak ditemukan atau sudah dihapus',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Kategori berhasil dihapus',
      data: deletedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kategori: ' + error.message,
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};