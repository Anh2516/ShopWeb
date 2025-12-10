# Hướng dẫn kết nối Database

## Bước 1: Tạo file .env

Tạo file `.env` trong thư mục `server/` với nội dung:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shopweb_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

**Lưu ý:** Thay `your_mysql_password` bằng mật khẩu MySQL của bạn.

## Bước 2: Tạo Database

Chạy lệnh sau để tạo database và các bảng:

```bash
mysql -u root -p < server/database/schema.sql
```

Hoặc nếu không có mật khẩu:

```bash
mysql -u root < server/database/schema.sql
```

## Bước 3: Kiểm tra kết nối

Khởi động server:

```bash
cd server
npm run dev
```

Nếu kết nối thành công, bạn sẽ thấy:
```
✅ Đã kết nối MySQL thành công!
📊 Database: shopweb_db
🚀 Server đang chạy tại http://localhost:5000
```

## Xử lý lỗi

### Lỗi: "Access denied for user"
- Kiểm tra lại `DB_USER` và `DB_PASSWORD` trong file `.env`
- Đảm bảo MySQL đang chạy

### Lỗi: "Unknown database"
- Chạy lại file `schema.sql` để tạo database
- Kiểm tra `DB_NAME` trong file `.env` có đúng không

### Lỗi: "Can't connect to MySQL server"
- Kiểm tra MySQL service đã khởi động chưa
- Kiểm tra `DB_HOST` (thường là `localhost`)

## Tạo tài khoản Admin

Sau khi kết nối database thành công:

```bash
cd server
node scripts/createAdmin.js
```

Tài khoản admin:
- Email: admin@shop.com
- Password: admin123

