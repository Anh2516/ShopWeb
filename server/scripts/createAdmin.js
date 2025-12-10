const bcrypt = require('bcryptjs');
const { pool: db } = require('../config/database');
const { generateUniqueCustomerCode } = require('../utils/customerCode');
require('dotenv').config();

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
      console.log('Đã cập nhật tài khoản admin!');
    } else {
      // Create new admin
      const customerCode = await generateUniqueCustomerCode(db);
      await db.execute(
        'INSERT INTO users (email, password, name, balance, customer_code, role) VALUES (?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, name, 0, customerCode, 'admin']
      );
      console.log('Đã tạo tài khoản admin!');
    }
    
    console.log('Email: admin@shop.com');
    console.log('Password: admin123');
    console.log('\nVui lòng đổi mật khẩu sau khi đăng nhập!');
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi tạo admin:', error);
    process.exit(1);
  }
}

createAdmin();

