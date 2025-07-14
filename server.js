// Không cần require dotenv ở đây vì config.js đã xử lý
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./src/database/db');
const config = require('./config');

// Khởi tạo ứng dụng Express
const app = express();
const PORT = config.port;

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

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});