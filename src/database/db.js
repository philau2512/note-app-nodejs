const mysql = require('mysql2/promise');
const config = require('../../config');

// Cấu hình kết nối MySQL
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
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