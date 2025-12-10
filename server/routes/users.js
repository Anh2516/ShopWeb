const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { pool: db } = require('../config/database');
const { verifyToken, requireAdmin } = require('../config/auth');
const { generateUniqueCustomerCode, ensureCustomerCode } = require('../utils/customerCode');

const createValidators = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('name').notEmpty().withMessage('Tên không được để trống'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Vai trò không hợp lệ'),
  body('balance').optional().isFloat({ min: 0 }).withMessage('Số dư phải lớn hơn hoặc bằng 0')
];

const updateValidators = [
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('name').optional({ checkFalsy: true }).notEmpty().withMessage('Tên không được để trống'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Vai trò không hợp lệ'),
  body('balance').optional().isFloat({ min: 0 }).withMessage('Số dư phải lớn hơn hoặc bằng 0')
];

// Lấy tất cả users (Admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, email, name, phone, address, balance, customer_code, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      const numericId = parseInt(search, 10);
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?';
      params.push(keyword, keyword, keyword);
      if (!isNaN(numericId)) {
        query += ' OR id = ?';
        params.push(numericId);
      }
      query += ')';
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await db.execute(query, params);
    const enriched = await Promise.all(
      users.map(async (user) => {
        // Đếm số lượng pending topup transactions
        const [pendingCount] = await db.execute(
          'SELECT COUNT(*) as count FROM wallet_transactions WHERE user_id = ? AND type = ? AND status = ?',
          [user.id, 'topup', 'pending']
        );
        return {
        ...user,
          customer_code: await ensureCustomerCode(db, user.id, user.customer_code),
          pending_topup_count: pendingCount[0]?.count || 0
        };
      })
    );
    res.json({ users: enriched });
  } catch (error) {
    console.error('Lỗi lấy users:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo user mới (Admin)
router.post('/', verifyToken, requireAdmin, createValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, phone, address, role = 'user', balance = 0 } = req.body;

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customerCode = await generateUniqueCustomerCode(db);

    const [result] = await db.execute(
      'INSERT INTO users (email, password, name, phone, address, balance, customer_code, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, phone || null, address || null, balance || 0, customerCode, role]
    );

    const [newUserRows] = await db.execute(
      'SELECT id, email, name, phone, address, balance, customer_code, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ user: newUserRows[0], message: 'Tạo user thành công' });
  } catch (error) {
    console.error('Lỗi tạo user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật user (Admin)
router.put('/:id', verifyToken, requireAdmin, updateValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = parseInt(req.params.id, 10);
    const { email, password, name, phone, address, role, balance } = req.body;

    const [existing] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    if (email && email !== existing[0].email) {
      const [emailCheck] = await db.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
    }

    if (role === 'user' && existing[0].id === req.user.userId && existing[0].role === 'admin') {
      return res.status(400).json({ message: 'Không thể tự hạ quyền admin của chính bạn' });
    }

    // Xây dựng danh sách cập nhật - chỉ cập nhật các trường có trong req.body
    const updates = [];
    const updateValues = [];

    if (email !== undefined) {
      updates.push('email = ?');
      updateValues.push(email);
    }
    if (name !== undefined) {
      updates.push('name = ?');
      updateValues.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      updateValues.push(phone || null);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      updateValues.push(address || null);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      updateValues.push(role);
    }
    if (balance !== undefined) {
      updates.push('balance = ?');
      updateValues.push(balance);
    }

    if (updates.length > 0) {
      updateValues.push(userId);
      await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, updateValues);
    }

    // Cập nhật mật khẩu nếu có và không rỗng
    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    }

    const [updatedUserRows] = await db.execute(
      'SELECT id, email, name, phone, address, balance, customer_code, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ user: updatedUserRows[0], message: 'Cập nhật user thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa user (Admin)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'Không thể tự xóa tài khoản của bạn' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Xóa user thành công' });
  } catch (error) {
    console.error('Lỗi xóa user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;

