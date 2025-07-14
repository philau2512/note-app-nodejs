# Ứng dụng Ghi chú (Note App)

Một ứng dụng ghi chú đơn giản sử dụng Node.js, Express và MySQL.

## Tính năng

- Tạo, xem, chỉnh sửa và xóa ghi chú
- Phân loại ghi chú theo danh mục
- Tìm kiếm ghi chú theo nội dung
- Sắp xếp ghi chú theo nhiều tiêu chí khác nhau
- Lưu trữ dữ liệu trong cơ sở dữ liệu MySQL

## Yêu cầu

- Node.js (>= 14.x)
- MySQL (>= 5.7)

## Cài đặt

1. Clone repository:
   ```
   git clone https://github.com/username/note-app-nodejs.git
   cd note-app-nodejs
   ```

2. Cài đặt các dependencies:
   ```
   npm install
   ```

3. Tạo file .env trong thư mục gốc với nội dung sau:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=note_app_db
   ```
   (Thay đổi các thông số kết nối MySQL theo môi trường của bạn)

4. Khởi tạo cơ sở dữ liệu:
   ```
   node src/database/init-db.js
   ```

5. Khởi động ứng dụng:
   ```
   npm start
   ```
   hoặc để phát triển:
   ```
   npm run dev
   ```

6. Truy cập ứng dụng tại: http://localhost:3000

## Cấu trúc dự án

```
note-app-nodejs/
├── public/                # Tài nguyên tĩnh
│   ├── css/               # File CSS
│   │   └── styles.css
│   └── js/                # File JavaScript
│       └── main.js
├── src/                   # Mã nguồn server
│   ├── database/          # Kết nối và model database
│   │   ├── db.js
│   │   ├── init-db.js
│   │   ├── noteModel.js
│   │   └── categoryModel.js
│   └── routes/            # Định tuyến API
│       └── notes.js
├── views/                 # Template view
│   └── index.ejs
├── .env                   # Biến môi trường
├── package.json           # Cấu hình npm
├── server.js              # Điểm vào của ứng dụng
└── README.md              # Tài liệu
```

## Cách sử dụng

1. Tạo ghi chú mới:
   - Nhấn nút "Tạo mới"
   - Nhập tiêu đề, nội dung, ghi chú và chọn danh mục
   - Nhấn "Lưu"

2. Chỉnh sửa ghi chú:
   - Nhấn vào ghi chú muốn chỉnh sửa
   - Thay đổi thông tin
   - Nhấn "Lưu"

3. Xóa ghi chú:
   - Nhấn vào ghi chú muốn xóa
   - Nhấn nút "Xóa" trong modal chỉnh sửa
   - Xác nhận xóa

4. Tìm kiếm:
   - Nhập từ khóa vào ô tìm kiếm
   - Nhấn nút tìm kiếm hoặc Enter

5. Lọc theo danh mục:
   - Nhấn vào danh mục muốn lọc ở thanh bên trái

6. Sắp xếp:
   - Nhấn nút "Sắp xếp"
   - Chọn tiêu chí sắp xếp từ dropdown menu
