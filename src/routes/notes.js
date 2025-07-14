const express = require('express');
const router = express.Router();
const NoteModel = require('../database/noteModel');
const CategoryModel = require('../database/categoryModel');

// Lấy tất cả ghi chú - API
router.get('/', async (req, res) => {
  try {
    const { sort = 'created_at', order = 'DESC', category } = req.query;
    const notes = await NoteModel.getAll(sort, order, category);
    res.json(notes);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ghi chú:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách ghi chú' });
  }
});

// Lấy một ghi chú theo ID - API
router.get('/:id', async (req, res) => {
  try {
    const note = await NoteModel.getById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    }
    res.json(note);
  } catch (error) {
    console.error('Lỗi khi lấy ghi chú:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy ghi chú' });
  }
});

// Tạo ghi chú mới - API
router.post('/', async (req, res) => {
  try {
    const { title, content, note, category_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Tiêu đề là bắt buộc' });
    }
    
    const newNoteId = await NoteModel.create({ title, content, note, category_id });
    res.status(201).json({ id: newNoteId, message: 'Ghi chú đã được tạo thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo ghi chú:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi tạo ghi chú' });
  }
});

// Cập nhật ghi chú - API
router.put('/:id', async (req, res) => {
  try {
    const { title, content, note, category_id } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Tiêu đề là bắt buộc' });
    }
    
    const success = await NoteModel.update(req.params.id, { title, content, note, category_id });
    
    if (!success) {
      return res.status(404).json({ error: 'Không tìm thấy ghi chú hoặc không có thay đổi' });
    }
    
    res.json({ message: 'Ghi chú đã được cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật ghi chú:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật ghi chú' });
  }
});

// Xóa ghi chú - API
router.delete('/:id', async (req, res) => {
  try {
    const success = await NoteModel.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
    }
    
    res.json({ message: 'Ghi chú đã được xóa thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa ghi chú:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa ghi chú' });
  }
});

// Tìm kiếm ghi chú - API
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const results = await NoteModel.search(searchTerm);
    res.json(results);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm ghi chú:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi tìm kiếm ghi chú' });
  }
});

// Lấy tất cả danh mục - API
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await CategoryModel.getAll();
    res.json(categories);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách danh mục' });
  }
});

// Thêm danh mục mới - API
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
    }
    
    const newCategoryId = await CategoryModel.create(name);
    res.status(201).json({ id: newCategoryId, message: 'Danh mục đã được tạo thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi tạo danh mục' });
  }
});

// Cập nhật danh mục - API
router.put('/categories/:id', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
    }
    
    const success = await CategoryModel.update(req.params.id, name);
    
    if (!success) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục hoặc không có thay đổi' });
    }
    
    res.json({ message: 'Danh mục đã được cập nhật thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật danh mục:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi cập nhật danh mục' });
  }
});

// Xóa danh mục - API
router.delete('/categories/:id', async (req, res) => {
  try {
    // Không cho phép xóa danh mục "Khác" (id 6)
    if (req.params.id == 6) {
      return res.status(400).json({ error: 'Không thể xóa danh mục mặc định' });
    }
    
    const success = await CategoryModel.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    }
    
    res.json({ message: 'Danh mục đã được xóa thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa danh mục:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa danh mục' });
  }
});

module.exports = router; 