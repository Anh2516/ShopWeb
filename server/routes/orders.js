const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { verifyToken, requireAdmin } = require('../config/auth');

// Tạo đơn hàng mới
router.post('/', verifyToken, async (req, res) => {
  const { items, total, shipping_address, payment_method, payment_gateway } = req.body;
  const userId = req.user.userId;
  const orderTotal = Number(total) || 0;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Giỏ hàng trống' });
  }

  if (!shipping_address || !shipping_address.trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập địa chỉ giao hàng' });
  }

  // Validate items
  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0 || !item.price || item.price <= 0) {
      return res.status(400).json({ message: 'Thông tin sản phẩm không hợp lệ' });
    }
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [userRows] = await connection.execute(
      'SELECT balance FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (userRows[0].balance < orderTotal) {
      await connection.rollback();
      return res.status(400).json({ message: 'Số dư không đủ, vui lòng nạp thêm tiền' });
    }

    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total, shipping_address, payment_method, payment_gateway, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, orderTotal, shipping_address, payment_method || 'wallet', payment_gateway || 'wallet', 'pending']
    );

    const orderId = orderResult.insertId;

    // Kiểm tra số lượng sản phẩm trong kho trước khi tạo đơn hàng
    for (const item of items) {
      const [productRows] = await connection.execute(
        'SELECT id, name, stock FROM products WHERE id = ? FOR UPDATE',
        [item.product_id]
      );

      if (productRows.length === 0) {
        await connection.rollback();
        return res.status(400).json({ message: `Sản phẩm ID ${item.product_id} không tồn tại` });
      }

      const product = productRows[0];
      if (product.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Sản phẩm "${product.name}" không đủ số lượng. Còn lại: ${product.stock}` 
        });
      }
    }

    // Tạo order_items và trừ số lượng sản phẩm
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.execute(
      'UPDATE users SET balance = balance - ? WHERE id = ?',
      [orderTotal, userId]
    );

    await connection.commit();

    const [order] = await connection.execute(
      `SELECT o.*, 
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'id', oi.id,
           'product_id', oi.product_id,
           'product_name', p.name,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = ?
       GROUP BY o.id`,
      [orderId]
    );

    // Lấy balance mới của user để trả về
    const [updatedUserRows] = await db.execute(
      'SELECT balance FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({ 
      order: order[0], 
      message: 'Tạo đơn hàng thành công',
      newBalance: updatedUserRows[0]?.balance || 0
    });
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }
    res.status(500).json({ 
      message: error.message || 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Lấy đơn hàng của user
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ orders });
  } catch (error) {
    console.error('Lỗi lấy đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy chi tiết đơn hàng
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, 
       JSON_ARRAYAGG(
         JSON_OBJECT(
           'id', oi.id,
           'product_id', oi.product_id,
           'product_name', p.name,
           'product_image', p.image,
           'quantity', oi.quantity,
           'price', oi.price
         )
       ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.id = ? AND o.user_id = ?
       GROUP BY o.id`,
      [req.params.id, req.user.userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const order = orders[0];
    // Parse JSON_ARRAYAGG từ string thành array
    if (order.items && typeof order.items === 'string') {
      try {
        order.items = JSON.parse(order.items);
      } catch (e) {
        order.items = [];
      }
    } else if (!order.items) {
      order.items = [];
    }

    res.json({ order });
  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy tất cả đơn hàng (Admin only)
router.get('/admin/all', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1`;
    const params = [];

    if (status && ['pending','processing','shipped','completed','cancelled'].includes(status)) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      const numericId = parseInt(search, 10);
      if (!isNaN(numericId)) {
        query += ' AND (o.id = ? OR u.name LIKE ? OR u.email LIKE ? OR o.shipping_address LIKE ?)';
        params.push(numericId, keyword, keyword, keyword);
      } else {
        query += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.shipping_address LIKE ?)';
        params.push(keyword, keyword, keyword);
      }
    }

    query += ' ORDER BY o.created_at DESC';

    const [orders] = await db.execute(query, params);

    res.json({ orders });
  } catch (error) {
    console.error('Lỗi lấy đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy chi tiết đơn hàng (Admin)
router.get('/admin/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;

    const [orders] = await db.execute(
      `SELECT o.*, 
        u.name as user_name, 
        u.email as user_email,
        u.phone as user_phone,
        u.address as user_address
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const [items] = await db.execute(
      `SELECT oi.*, 
        p.name as product_name,
        p.image as product_image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({ order: { ...orders[0], items } });
  } catch (error) {
    console.error('Lỗi lấy chi tiết đơn hàng admin:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật trạng thái đơn hàng (Admin only)
router.put('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật đơn hàng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;

