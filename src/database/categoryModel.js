const db = require('./db');

class CategoryModel {
  // Lấy tất cả danh mục
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      throw error;
    }
  }

  // Lấy danh mục theo ID
  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy danh mục theo ID:', error);
      throw error;
    }
  }

  // Thêm danh mục mới
  static async create(name) {
    try {
      const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo danh mục mới:', error);
      throw error;
    }
  }

  // Cập nhật danh mục
  static async update(id, name) {
    try {
      const [result] = await db.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      throw error;
    }
  }

  // Xóa danh mục
  static async delete(id) {
    try {
      // Cập nhật tất cả các ghi chú thuộc danh mục này sang "Khác" (id 6)
      await db.query('UPDATE notes SET category_id = 6 WHERE category_id = ?', [id]);
      
      // Xóa danh mục
      const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      throw error;
    }
  }
}

module.exports = CategoryModel; 