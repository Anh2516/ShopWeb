const { pool: db } = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateUniqueCustomerCode } = require('../utils/customerCode');
require('dotenv').config();

async function checkDatabaseConnection() {
  try {
    await db.execute('SELECT 1');
    console.log('✅ Kết nối database thành công!\n');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    console.error('\n💡 Hãy kiểm tra:');
    console.error('   1. MySQL đã được cài đặt và đang chạy chưa?');
    console.error('   2. File .env đã được cấu hình đúng chưa?');
    console.error('   3. Database đã được tạo chưa? (chạy: mysql -u root -p < server/database/schema.sql)\n');
    return false;
  }
}

async function checkTablesExist() {
  try {
    const [tables] = await db.execute(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DB_NAME || 'shopweb_db']
    );
    
    const requiredTables = ['users', 'categories', 'products', 'orders'];
    const existingTables = tables.map(t => t.TABLE_NAME);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.error(`❌ Thiếu các bảng: ${missingTables.join(', ')}`);
      console.error('\n💡 Hãy chạy file schema.sql để tạo database:');
      console.error('   mysql -u root -p < server/database/schema.sql\n');
      return false;
    }
    
    console.log('✅ Tất cả các bảng cần thiết đã tồn tại!\n');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra bảng:', error.message);
    return false;
  }
}


async function createAdmin() {
  try {
    const email = 'manager@shop.com';
    const password = 'manager123';
    const name = 'Manager';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin exists
    const [existing] = await db.execute(
      'SELECT id, customer_code FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      // Update existing admin
      if (!existing[0].customer_code) {
        const newCode = await generateUniqueCustomerCode(db);
        await db.execute('UPDATE users SET customer_code = ? WHERE id = ?', [newCode, existing[0].id]);
      }
      await db.execute(
        'UPDATE users SET password = ?, role = ? WHERE email = ?',
        [hashedPassword, 'admin', email]
      );
      console.log('✅ Đã cập nhật tài khoản admin!');
    } else {
      // Create new admin
      const customerCode = await generateUniqueCustomerCode(db);
      await db.execute(
        'INSERT INTO users (email, password, name, balance, customer_code, role) VALUES (?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, name, 0, customerCode, 'admin']
      );
      console.log('✅ Đã tạo tài khoản admin!');
    }
    
    console.log('\n📧 Thông tin đăng nhập admin:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Vui lòng đổi mật khẩu sau khi đăng nhập!\n');
    return true;
  } catch (error) {
    console.error('❌ Lỗi tạo admin:', error.message);
    return false;
  }
}

async function setup() {
  console.log('🚀 Bắt đầu setup database...\n');
  console.log('='.repeat(50));
  console.log('');

  // 1. Kiểm tra kết nối database
  console.log('📡 Bước 1: Kiểm tra kết nối database...');
  const dbConnected = await checkDatabaseConnection();
  if (!dbConnected) {
    process.exit(1);
  }

  // 2. Kiểm tra bảng có tồn tại không
  console.log('📋 Bước 2: Kiểm tra các bảng trong database...');
  const tablesExist = await checkTablesExist();
  if (!tablesExist) {
    process.exit(1);
  }

  // 3. Tạo tài khoản admin
  console.log('👤 Bước 3: Tạo tài khoản admin...');
  await createAdmin();

  // Hoàn thành
  console.log('='.repeat(50));
  console.log('✅ Setup hoàn tất!\n');
  console.log('📝 Các bước tiếp theo:');
  console.log('   1. Kiểm tra file .env đã cấu hình đúng chưa');
  console.log('   2. Chạy server: npm run dev (hoặc npm start)');
  console.log('   3. Truy cập http://localhost:3000 để sử dụng ứng dụng\n');

  process.exit(0);
}

setup();

