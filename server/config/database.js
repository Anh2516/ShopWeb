const mysql = require('mysql2');
require('dotenv').config();

// Tạo pool với callback để có thể test connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'shopweb_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export promise pool để sử dụng với async/await
const promisePool = pool.promise();

// Hàm test connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Đã kết nối MySQL thành công!');
    console.log(`📊 Database: ${process.env.DB_NAME || 'shopweb_db'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    console.error('\n💡 Hướng dẫn khắc phục:');
    
    // Kiểm tra xem file .env có tồn tại không
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    
    if (!fs.existsSync(envPath)) {
      console.error('\n⚠️  File .env chưa được tạo!');
      console.error('   Tạo file server/.env với nội dung:');
      console.error('   ──────────────────────────────────');
      console.error('   PORT=5000');
      console.error('   DB_HOST=localhost');
      console.error('   DB_USER=root');
      console.error('   DB_PASSWORD=your_mysql_password');
      console.error('   DB_NAME=shopweb_db');
      console.error('   JWT_SECRET=your_secret_key');
      console.error('   JWT_EXPIRE=7d');
      console.error('   ──────────────────────────────────');
      console.error('   ⚠️  Thay your_mysql_password bằng mật khẩu MySQL của bạn!');
      console.error('   ⚠️  Nếu MySQL không có mật khẩu, để trống: DB_PASSWORD=');
    } else {
      console.error('\n📝 Thông tin kết nối hiện tại:');
      console.error(`   Host: ${process.env.DB_HOST || 'localhost'}`);
      console.error(`   User: ${process.env.DB_USER || 'root'}`);
      console.error(`   Password: ${process.env.DB_PASSWORD ? '*** (đã có)' : 'KHÔNG CÓ (để trống)'}`);
      console.error(`   Database: ${process.env.DB_NAME || 'shopweb_db'}`);
      console.error('\n💡 Nếu lỗi "Access denied":');
      console.error('   1. Kiểm tra mật khẩu MySQL trong file .env có đúng không');
      console.error('   2. Thử đăng nhập MySQL bằng: mysql -u root -p');
      console.error('   3. Nếu MySQL không có mật khẩu, đảm bảo DB_PASSWORD= trong .env');
    }
    
    console.error('\n📚 Xem thêm hướng dẫn trong: server/README_DATABASE.md');
    return false;
  }
};

module.exports = {
  pool: promisePool,
  testConnection
};

