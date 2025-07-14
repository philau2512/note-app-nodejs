require('dotenv').config();
const mysql = require('mysql2/promise');

const createDatabase = async () => {
  try {
    // Tạo kết nối đến MySQL (không chọn database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'yourpassword'
    });
    
    // Tạo database nếu chưa tồn tại
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'note_app_db'}`);
    console.log('Database đã được tạo hoặc đã tồn tại');
    
    // Chọn database để làm việc
    await connection.query(`USE ${process.env.DB_NAME || 'note_app_db'}`);
    
    // Tạo bảng categories
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tạo bảng notes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        note TEXT,
        category_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    
    // Thêm một số danh mục mặc định
    await connection.query(`
      INSERT IGNORE INTO categories (id, name) VALUES 
      (1, 'JavaScript'), 
      (2, 'HTML'), 
      (3, 'CSS'),
      (4, 'Node.js'),
      (5, 'Database'),
      (6, 'Khác')
    `);
    
    console.log('Cấu trúc database đã được khởi tạo thành công');
    await connection.end();
  } catch (error) {
    console.error('Lỗi khởi tạo database:', error);
  }
};

// Chạy hàm khởi tạo
createDatabase(); 