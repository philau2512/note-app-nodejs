// Không cần require dotenv ở đây nữa vì config.js đã xử lý
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config');

// Khởi tạo ứng dụng Express
const app = express();

// Log thông tin cấu hình để debug
console.log('Server sử dụng cấu hình:', {
  port: config.port,
  dbConfig: {
    host: config.db.host,
    database: config.db.database,
    user: config.db.user
  }
});

// Cấu hình middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const noteRoutes = require('./src/routes/notes');

// Sử dụng routes
app.use('/api/notes', noteRoutes);

// Route mặc định - trang chủ
app.get('/', (req, res) => {
  res.render('index');
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error('Lỗi server:', err);
  res.status(500).json({ error: 'Đã xảy ra lỗi máy chủ' });
});

// Sử dụng port từ config
const PORT = config.port;

// Start server và export để sử dụng trong main.js
const server = app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

module.exports = server;