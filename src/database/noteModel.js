const db = require('./db');

class NoteModel {
  // Lấy tất cả ghi chú
  static async getAll(sortField = 'created_at', sortOrder = 'DESC', categoryId = null) {
    try {
      let query = `
        SELECT n.*, c.name as category_name 
        FROM notes n
        LEFT JOIN categories c ON n.category_id = c.id
      `;
      
      const params = [];
      
      // Lọc theo category nếu có
      if (categoryId) {
        query += ` WHERE n.category_id = ?`;
        params.push(categoryId);
      }
      
      // Sắp xếp
      query += ` ORDER BY n.${sortField} ${sortOrder}`;
      
      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ghi chú:', error);
      throw error;
    }
  }

  // Lấy một ghi chú theo ID
  static async getById(id) {
    try {
      const [rows] = await db.query(
        `SELECT n.*, c.name as category_name 
         FROM notes n
         LEFT JOIN categories c ON n.category_id = c.id
         WHERE n.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Lỗi khi lấy ghi chú theo ID:', error);
      throw error;
    }
  }

  // Thêm ghi chú mới
  static async create(note) {
    try {
      const [result] = await db.query(
        'INSERT INTO notes (title, content, note, category_id) VALUES (?, ?, ?, ?)',
        [note.title, note.content, note.note, note.category_id]
      );
      return result.insertId;
    } catch (error) {
      console.error('Lỗi khi tạo ghi chú mới:', error);
      throw error;
    }
  }

  // Cập nhật ghi chú
  static async update(id, note) {
    try {
      const [result] = await db.query(
        'UPDATE notes SET title = ?, content = ?, note = ?, category_id = ? WHERE id = ?',
        [note.title, note.content, note.note, note.category_id, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi cập nhật ghi chú:', error);
      throw error;
    }
  }

  // Xóa ghi chú
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM notes WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Lỗi khi xóa ghi chú:', error);
      throw error;
    }
  }

  // Tìm kiếm ghi chú
  static async search(searchTerm) {
    try {
      const searchValue = `%${searchTerm}%`;
      const [rows] = await db.query(
        `SELECT n.*, c.name as category_name 
         FROM notes n
         LEFT JOIN categories c ON n.category_id = c.id
         WHERE n.title LIKE ? OR n.content LIKE ? OR n.note LIKE ?`,
        [searchValue, searchValue, searchValue]
      );
      return rows;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm ghi chú:', error);
      throw error;
    }
  }
}

module.exports = NoteModel; 