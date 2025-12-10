const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { verifyToken, requireAdmin } = require('../config/auth');

// Middleware kiểm tra admin cho tất cả routes
router.use(verifyToken);
router.use(requireAdmin);

// Thống kê tổng quan
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [totalProducts] = await db.execute('SELECT COUNT(*) as count FROM products');
    const [totalOrders] = await db.execute('SELECT COUNT(*) as count FROM orders');
    const [totalRevenue] = await db.execute('SELECT SUM(total) as revenue FROM orders WHERE status = "completed"');
    const [recentOrders] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
    );
    const [totalBalance] = await db.execute('SELECT SUM(balance) as balance FROM users WHERE role = "user"');
    const [importCost] = await db.execute('SELECT SUM(total_cost) as total FROM inventory_entries');
    const [bestSellers] = await db.execute(
      `SELECT p.id, p.name, p.image, SUM(oi.quantity) as total_sold
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.status IN ("completed","shipped","processing")
       GROUP BY p.id, p.name, p.image
       ORDER BY total_sold DESC
       LIMIT 3`
    );

    const revenue = totalRevenue[0].revenue || 0;
    const cost = importCost[0].total || 0;
    const [pendingTopupCount] = await db.execute(
      'SELECT COUNT(*) as count FROM wallet_transactions WHERE type = ? AND status = ?',
      ['topup', 'pending']
    );
    const [pendingOrdersCount] = await db.execute(
      'SELECT COUNT(*) as count FROM orders WHERE status = ?',
      ['pending']
    );
    
    res.json({
      stats: {
        totalUsers: totalUsers[0].count,
        totalProducts: totalProducts[0].count,
        totalOrders: totalOrders[0].count,
        totalRevenue: revenue,
        profit: revenue - cost,
        recentOrders: recentOrders[0].count,
        totalBalance: totalBalance[0].balance || 0,
        pendingTopupCount: pendingTopupCount[0].count || 0,
        pendingOrdersCount: pendingOrdersCount[0].count || 0
      },
      bestSellers
    });
  } catch (error) {
    console.error('Lỗi lấy thống kê:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy dữ liệu doanh thu theo thời gian
router.get('/revenue-chart', async (req, res) => {
  try {
    const { period = '7' } = req.query; // 7, 30, hoặc 365 ngày
    
    let dateCondition = '';
    if (period === '7') {
      dateCondition = 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (period === '30') {
      dateCondition = 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    } else if (period === '365') {
      dateCondition = 'DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
    }

    const [revenueData] = await db.execute(
      `SELECT 
        DATE(created_at) as date,
        SUM(total) as revenue,
        COUNT(*) as orders
       FROM orders 
       WHERE status = 'completed' AND ${dateCondition}
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.json({ data: revenueData });
  } catch (error) {
    console.error('Lỗi lấy dữ liệu chart:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Quản lý categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name');
    res.json({ categories });
  } catch (error) {
    console.error('Lỗi lấy categories:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const [result] = await db.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    res.status(201).json({ message: 'Tạo category thành công', id: result.insertId });
  } catch (error) {
    console.error('Lỗi tạo category:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    await db.execute(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, req.params.id]
    );
    res.json({ message: 'Cập nhật category thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật category:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa category thành công' });
  } catch (error) {
    console.error('Lỗi xóa category:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;

