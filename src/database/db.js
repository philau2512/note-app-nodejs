const mysql = require('mysql2/promise');

// Cấu hình kết nối MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME || 'note_app_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối
pool.getConnection()
  .then(connection => {
    console.log('Kết nối thành công đến MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('Lỗi kết nối đến MySQL:', err);
  });

module.exports = pool; 