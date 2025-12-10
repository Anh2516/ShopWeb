const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/database');
const { verifyToken, requireAdmin } = require('../config/auth');

const buildProductQuery = ({ category, search, limitNum, offset, includeHidden }) => {
  let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1';
  const params = [];

  if (!includeHidden) {
    query += ' AND p.is_visible = 1';
  }

  if (category) {
    const categoryId = parseInt(category, 10);
    if (!isNaN(categoryId)) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }
  }

  if (search && search.trim()) {
    const trimmed = search.trim();
    const keyword = `%${trimmed}%`;
    const numericId = parseInt(trimmed, 10);
    query += ' AND (p.name LIKE ? OR p.description LIKE ?';
    params.push(keyword, keyword);
    if (!isNaN(numericId)) {
      query += ' OR p.id = ?';
      params.push(numericId);
    }
    query += ')';
  }

  query += ' ORDER BY p.created_at ASC';
  query += ` LIMIT ${limitNum} OFFSET ${offset}`;

  return { query, params };
};

const buildCountQuery = ({ category, search, includeHidden }) => {
  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
  const countParams = [];

  if (!includeHidden) {
    countQuery += ' AND is_visible = 1';
  }

  if (category) {
    countQuery += ' AND category_id = ?';
    countParams.push(parseInt(category, 10));
  }
  if (search && search.trim()) {
    const trimmed = search.trim();
    const keyword = `%${trimmed}%`;
    const numericId = parseInt(trimmed, 10);
    countQuery += ' AND (name LIKE ? OR description LIKE ?';
    countParams.push(keyword, keyword);
    if (!isNaN(numericId)) {
      countQuery += ' OR id = ?';
      countParams.push(numericId);
    }
    countQuery += ')';
  }

  return { countQuery, countParams };
};

const getPaginationMeta = (pageNum, limitNum, total) => ({
  page: pageNum,
  limit: limitNum,
  total: total || 0,
  pages: Math.ceil((total || 0) / limitNum)
});

const listProducts = async (req, res, includeHidden = false) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const { query, params } = buildProductQuery({ category, search, limitNum, offset, includeHidden });
    const [products] = await db.execute(query, params);

    const { countQuery, countParams } = buildCountQuery({ category, search, includeHidden });
    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    res.json({
      products: products || [],
      pagination: getPaginationMeta(pageNum, limitNum, total)
    });
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error);
    res.status(500).json({
      message: 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Lấy tất cả sản phẩm public
router.get('/', async (req, res) => listProducts(req, res, false));

// Lấy tất cả sản phẩm cho admin (bao gồm ẩn)
router.get('/admin', verifyToken, requireAdmin, async (req, res) => listProducts(req, res, true));

// Top sản phẩm bán chạy
router.get('/best-sellers', async (req, res) => {
  try {
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
    res.json({ bestSellers });
  } catch (error) {
    console.error('Lỗi lấy best seller:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy danh sách categories (public) - PHẢI ĐẶT TRƯỚC route /:id để tránh conflict
router.get('/categories/list', async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name');
    res.json({ categories });
  } catch (error) {
    console.error('Lỗi lấy categories:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy sản phẩm theo ID (phải đặt sau các route cụ thể như /categories/list, /best-sellers)
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    
    // Kiểm tra nếu không phải số thì có thể là route khác (như /categories/list)
    if (isNaN(productId)) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra xem có phải admin không (từ token nếu có)
    let includeHidden = false;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.role === 'admin') {
          includeHidden = true;
        }
      }
    } catch (e) {
      // Không phải admin hoặc token không hợp lệ, bỏ qua - user thường chỉ xem visible
    }

    // Lấy sản phẩm - chỉ hiển thị sản phẩm visible cho user thường, admin xem tất cả
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?';
    const params = [productId];
    
    if (!includeHidden) {
      query += ' AND p.is_visible = 1';
    }

    const [products] = await db.execute(query, params);

    if (products.length === 0) {
      // Kiểm tra xem sản phẩm có tồn tại nhưng bị ẩn không
      const [checkHidden] = await db.execute(
        'SELECT id FROM products WHERE id = ? AND is_visible = 0',
        [productId]
      );
      if (checkHidden.length > 0) {
        return res.status(404).json({ message: 'Sản phẩm này đang bị ẩn' });
      }
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const product = products[0];

    // Lấy danh sách ảnh của sản phẩm (nếu bảng tồn tại)
    product.images = [];
    try {
      const [images] = await db.execute(
        'SELECT id, image_url, display_order FROM product_images WHERE product_id = ? ORDER BY display_order ASC, id ASC',
        [productId]
      );

      if (images && Array.isArray(images)) {
        product.images = images.map(img => ({
          id: img.id,
          url: img.image_url,
          display_order: img.display_order
        }));
      }
    } catch (imageError) {
      // Nếu bảng product_images chưa tồn tại hoặc có lỗi, bỏ qua và tiếp tục
      console.warn('Không thể lấy ảnh sản phẩm (có thể bảng product_images chưa được tạo):', imageError.message);
      product.images = [];
    }

    res.json({ product });
  } catch (error) {
    console.error('Lỗi lấy sản phẩm:', error);
    res.status(500).json({ 
      message: error.message || 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Tạo sản phẩm mới (Admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image, is_visible } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    const [result] = await db.execute(
      'INSERT INTO products (name, description, price, stock, category_id, image, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, price, stock, category_id || null, image || null, typeof is_visible === 'undefined' ? 1 : is_visible ? 1 : 0]
    );

    const [newProduct] = await db.execute(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [result.insertId]
    );

    res.status(201).json({ product: newProduct[0], message: 'Tạo sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi tạo sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật sản phẩm (Admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image, is_visible } = req.body;

    await db.execute(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image = ?, is_visible = ? WHERE id = ?',
      [name, description, price, stock, category_id, image, typeof is_visible === 'undefined' ? 1 : is_visible ? 1 : 0, req.params.id]
    );

    const [updatedProduct] = await db.execute(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );

    res.json({ product: updatedProduct[0], message: 'Cập nhật sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật sản phẩm:', error);
    // Kiểm tra nếu lỗi do giá trị quá lớn
    if (error.message && error.message.includes('Out of range')) {
      return res.status(400).json({ message: 'Giá sản phẩm quá lớn. Giá tối đa là 9,999,999,999.99 ₫' });
    }
    res.status(500).json({ 
      message: error.message || 'Lỗi server',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Xóa sản phẩm (Admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi xóa sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật trạng thái trưng bày
router.put('/:id/visibility', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { is_visible } = req.body;
    const flag = is_visible ? 1 : 0;

    await db.execute('UPDATE products SET is_visible = ? WHERE id = ?', [flag, req.params.id]);

    const [productRows] = await db.execute(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
      [req.params.id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.json({ product: productRows[0], message: 'Cập nhật trạng thái trưng bày thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ============================================
// PRODUCT IMAGES API (Admin only)
// ============================================

// Thêm ảnh cho sản phẩm
router.post('/:id/images', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { image_url, display_order } = req.body;
    const productId = req.params.id;

    if (!image_url) {
      return res.status(400).json({ message: 'Vui lòng cung cấp URL ảnh' });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const [products] = await db.execute('SELECT id FROM products WHERE id = ?', [productId]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const order = display_order !== undefined ? parseInt(display_order, 10) : 0;

    const [result] = await db.execute(
      'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
      [productId, image_url, order]
    );

    const [newImage] = await db.execute(
      'SELECT id, image_url, display_order FROM product_images WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ image: newImage[0], message: 'Thêm ảnh thành công' });
  } catch (error) {
    console.error('Lỗi thêm ảnh:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Xóa ảnh của sản phẩm
router.delete('/:id/images/:imageId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id: productId, imageId } = req.params;

    // Kiểm tra ảnh thuộc về sản phẩm này
    const [images] = await db.execute(
      'SELECT id FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, productId]
    );

    if (images.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh' });
    }

    await db.execute('DELETE FROM product_images WHERE id = ?', [imageId]);
    res.json({ message: 'Xóa ảnh thành công' });
  } catch (error) {
    console.error('Lỗi xóa ảnh:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Cập nhật thứ tự hiển thị ảnh
router.put('/:id/images/:imageId/order', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id: productId, imageId } = req.params;
    const { display_order } = req.body;

    if (display_order === undefined) {
      return res.status(400).json({ message: 'Vui lòng cung cấp display_order' });
    }

    await db.execute(
      'UPDATE product_images SET display_order = ? WHERE id = ? AND product_id = ?',
      [parseInt(display_order, 10), imageId, productId]
    );

    res.json({ message: 'Cập nhật thứ tự thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật thứ tự ảnh:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Lấy tất cả ảnh của sản phẩm
router.get('/:id/images', async (req, res) => {
  try {
    const [images] = await db.execute(
      'SELECT id, image_url, display_order FROM product_images WHERE product_id = ? ORDER BY display_order ASC, id ASC',
      [req.params.id]
    );

    res.json({ images: images.map(img => ({
      id: img.id,
      url: img.image_url,
      display_order: img.display_order
    })) });
  } catch (error) {
    console.error('Lỗi lấy danh sách ảnh:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;

