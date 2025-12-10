const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { pool: db } = require('../config/database');
const { verifyToken, requireAdmin } = require('../config/auth');

const entryValidators = [
  body('product_name').notEmpty().withMessage('Vui lòng nhập tên sản phẩm'),
  body('product_image').notEmpty().withMessage('Vui lòng nhập link ảnh sản phẩm'),
  body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),
  body('unit_cost').isFloat({ min: 0 }).withMessage('Đơn giá không hợp lệ'),
  body('supplier_name').notEmpty().withMessage('Vui lòng nhập tên nhà cung cấp'),
  body('supplier_contact').optional().isLength({ max: 100 }).withMessage('Liên hệ quá dài'),
  body('supplier_email').optional().isEmail().withMessage('Email nhà cung cấp không hợp lệ'),
  body('supplier_address').optional(),
  body('note').optional().isLength({ max: 500 }).withMessage('Ghi chú quá dài')
];

const mapEntry = (entry) => ({
  ...entry,
  quantity: Number(entry.quantity),
  unit_cost: Number(entry.unit_cost),
  total_cost: Number(entry.total_cost)
});

router.use(verifyToken, requireAdmin);

// Danh sách nhập kho
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT ie.*, u.name AS created_by_name
      FROM inventory_entries ie
      LEFT JOIN users u ON ie.created_by = u.id
      WHERE 1=1`;
    const params = [];

    if (search && search.trim()) {
      const keyword = `%${search.trim()}%`;
      const numericId = parseInt(search, 10);
      query += ' AND (ie.product_name LIKE ? OR ie.supplier_name LIKE ? OR ie.supplier_contact LIKE ? OR ie.note LIKE ?';
      params.push(keyword, keyword, keyword, keyword);
      if (!isNaN(numericId)) {
        query += ' OR ie.id = ?';
        params.push(numericId);
      }
      query += ')';
    }

    query += ' ORDER BY ie.created_at DESC';

    const [entries] = await db.execute(query, params);

    res.json({ entries: entries.map(mapEntry) });
  } catch (error) {
    console.error('Lỗi lấy nhập kho:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tạo phiếu nhập kho
router.post('/', entryValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_name, product_image, quantity, unit_cost, note, supplier_name, supplier_contact, supplier_email, supplier_address } = req.body;
    const trimmedName = product_name.trim();
    const imageUrl = (product_image || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'Tên sản phẩm không hợp lệ' });
    }
    if (!imageUrl) {
      return res.status(400).json({ message: 'Link ảnh sản phẩm không hợp lệ' });
    }
    let productId = null;
    const [productRows] = await db.execute('SELECT id, image FROM products WHERE name = ? LIMIT 1', [trimmedName]);
    if (productRows.length > 0) {
      productId = productRows[0].id;
      if (!productRows[0].image) {
        await db.execute('UPDATE products SET image = ? WHERE id = ?', [imageUrl, productId]);
      }
      await db.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, productId]);
    } else {
      const [newProduct] = await db.execute(
        'INSERT INTO products (name, description, price, stock, category_id, image, is_visible) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [trimmedName, null, unit_cost, quantity, null, imageUrl]
      );
      productId = newProduct.insertId;
    }

    const totalCost = quantity * unit_cost;

    const [result] = await db.execute(
      `INSERT INTO inventory_entries (product_id, product_name, product_image, quantity, unit_cost, total_cost, note, created_by, supplier_name, supplier_contact, supplier_email, supplier_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, trimmedName, imageUrl, quantity, unit_cost, totalCost, note || null, req.user.userId, supplier_name, supplier_contact || null, supplier_email || null, supplier_address || null]
    );

    const [entryRows] = await db.execute(
      `SELECT ie.*, u.name AS created_by_name
       FROM inventory_entries ie
       LEFT JOIN users u ON ie.created_by = u.id
       WHERE ie.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ entry: mapEntry(entryRows[0]), message: 'Thêm phiếu nhập thành công' });
  } catch (error) {
    console.error('Lỗi tạo phiếu nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật phiếu nhập kho
router.put('/:id', entryValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entryId = parseInt(req.params.id, 10);
    const { product_name, product_image, quantity, unit_cost, note, supplier_name, supplier_contact, supplier_email, supplier_address } = req.body;
    const trimmedName = product_name.trim();
    const imageUrl = (product_image || '').trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'Tên sản phẩm không hợp lệ' });
    }
    if (!imageUrl) {
      return res.status(400).json({ message: 'Link ảnh sản phẩm không hợp lệ' });
    }

    const [existingRows] = await db.execute('SELECT * FROM inventory_entries WHERE id = ?', [entryId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    const existing = existingRows[0];

    let productId = null;
    const [productRows] = await db.execute('SELECT id FROM products WHERE name = ? LIMIT 1', [trimmedName]);
    if (productRows.length > 0) {
      productId = productRows[0].id;
      await db.execute('UPDATE products SET image = IFNULL(image, ?) WHERE id = ?', [imageUrl, productId]);
    } else {
      const [newProduct] = await db.execute(
        'INSERT INTO products (name, description, price, stock, category_id, image, is_visible) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [trimmedName, null, unit_cost, quantity, null, imageUrl]
      );
      productId = newProduct.insertId;
    }

    if (existing.product_id) {
      await db.execute('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [existing.quantity, existing.product_id]);
    }
    if (productId) {
      await db.execute('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, productId]);
    }

    const totalCost = quantity * unit_cost;

    await db.execute(
      `UPDATE inventory_entries
       SET product_id = ?, product_name = ?, product_image = ?, quantity = ?, unit_cost = ?, total_cost = ?, note = ?, supplier_name = ?, supplier_contact = ?, supplier_email = ?, supplier_address = ?
       WHERE id = ?`,
      [productId, trimmedName, imageUrl, quantity, unit_cost, totalCost, note || null, supplier_name, supplier_contact || null, supplier_email || null, supplier_address || null, entryId]
    );

    const [entryRows] = await db.execute(
      `SELECT ie.*, u.name AS created_by_name
       FROM inventory_entries ie
       LEFT JOIN users u ON ie.created_by = u.id
       WHERE ie.id = ?`,
      [entryId]
    );

    res.json({ entry: mapEntry(entryRows[0]), message: 'Cập nhật phiếu nhập thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật phiếu nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa phiếu nhập
router.delete('/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id, 10);

    const [existingRows] = await db.execute('SELECT * FROM inventory_entries WHERE id = ?', [entryId]);
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phiếu nhập' });
    }

    const existing = existingRows[0];

    if (existing.product_id) {
      await db.execute('UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?', [existing.quantity, existing.product_id]);
    }
    await db.execute('DELETE FROM inventory_entries WHERE id = ?', [entryId]);

    res.json({ message: 'Xóa phiếu nhập thành công' });
  } catch (error) {
    console.error('Lỗi xóa phiếu nhập:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;


