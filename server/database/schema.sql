-- ============================================
-- SCHEMA DATABASE SHOPWEB - HOÀN CHỈNH
-- ============================================
-- File này chứa toàn bộ cấu trúc database và dữ liệu mẫu
-- Chạy file này để tạo database từ đầu

-- Tạo database
CREATE DATABASE IF NOT EXISTS shopweb_db;
USE shopweb_db;

-- ============================================
-- TẠO CÁC BẢNG
-- ============================================

-- Bảng users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  balance DECIMAL(12, 2) DEFAULT 0,
  customer_code CHAR(5) UNIQUE NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  stock INT DEFAULT 0,
  category_id INT,
  image VARCHAR(500),
  is_visible TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Bảng orders
-- Lưu ý: payment_gateway đã được đổi từ ENUM sang VARCHAR để hỗ trợ 'wallet'
-- Lưu ý: total đã được đổi từ DECIMAL(10,2) sang DECIMAL(12,2) để hỗ trợ giá trị lớn hơn
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(12, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'wallet',
  payment_gateway VARCHAR(50) DEFAULT 'wallet',
  status ENUM('pending', 'processing', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng order_items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng product_images (lưu nhiều ảnh cho mỗi sản phẩm)
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_display_order (display_order)
);

-- Bảng nhập kho
CREATE TABLE IF NOT EXISTS inventory_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  quantity INT NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  note TEXT,
  created_by INT,
  supplier_name VARCHAR(255) NOT NULL,
  supplier_contact VARCHAR(100),
  supplier_email VARCHAR(255),
  supplier_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng giao dịch ví
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  method VARCHAR(50) DEFAULT 'transfer',
  type ENUM('topup', 'purchase', 'refund') DEFAULT 'topup',
  note TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT,
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- DỮ LIỆU MẪU (TÙY CHỌN)
-- ============================================
-- Bỏ comment các dòng dưới nếu muốn thêm dữ liệu mẫu

-- Thêm categories mẫu
INSERT INTO categories (name, description) VALUES
('Điện thoại', 'Các loại điện thoại thông minh'),
('Laptop', 'Máy tính xách tay'),
('Phụ kiện', 'Các phụ kiện điện tử'),
('Đồ gia dụng', 'Đồ dùng trong gia đình')
ON DUPLICATE KEY UPDATE name=name;

-- ============================================
-- MIGRATION: Cập nhật payment_gateway và total cho database cũ
-- ============================================
-- Nếu database đã tồn tại, chạy các lệnh sau:

-- ALTER TABLE orders 
-- MODIFY COLUMN payment_gateway VARCHAR(50) DEFAULT 'wallet';
-- 
-- UPDATE orders SET payment_gateway = 'wallet' WHERE payment_gateway != 'wallet';
--
-- ALTER TABLE orders
-- MODIFY COLUMN total DECIMAL(12, 2) NOT NULL;

-- ============================================
-- GHI CHÚ
-- ============================================
-- 1. Tạo admin bằng script: node scripts/createAdmin.js
-- 2. Hoặc tạo thủ công và hash password bằng bcrypt
-- 3. Để thêm dữ liệu mẫu đầy đủ, chạy file sample-data.sql riêng
-- 4. payment_gateway đã được đổi từ ENUM sang VARCHAR để hỗ trợ 'wallet'
