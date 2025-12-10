-- Dữ liệu mẫu cho hệ thống bán hàng
USE shopweb_db;

-- Xóa dữ liệu cũ (nếu có)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE wallet_transactions;
TRUNCATE TABLE inventory_entries;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Thêm categories mẫu
INSERT INTO categories (name, description) VALUES
('Điện thoại', 'Các loại điện thoại thông minh, smartphone'),
('Laptop', 'Máy tính xách tay, laptop gaming, văn phòng'),
('Phụ kiện', 'Tai nghe, sạc, ốp lưng, cáp sạc'),
('Đồ gia dụng', 'Đồ dùng trong gia đình, thiết bị nhà bếp'),
('Thời trang', 'Quần áo, giày dép, phụ kiện thời trang'),
('Sách', 'Sách văn học, sách kỹ thuật, sách giáo khoa');

-- Thêm users mẫu (password đã được hash: password123)
-- Mật khẩu: password123 cho tất cả user
-- Lưu ý: Password hash được tạo bằng bcrypt với salt rounds = 10
INSERT INTO users (email, password, name, phone, address, balance, customer_code, role) VALUES
('admin@shop.com', '$2a$10$4WIo8M2rVBWg1.lhNEELrurjULjFe.HHrUFBX17pT8/Q1gCVpS74i', 'Admin', '0123456789', '123 Đường ABC, Quận 1, TP.HCM', 100000000, '90001', 'admin'),
('user1@example.com', '$2a$10$4WIo8M2rVBWg1.lhNEELrurjULjFe.HHrUFBX17pT8/Q1gCVpS74i', 'Nguyễn Văn A', '0987654321', '456 Đường XYZ, Quận 2, TP.HCM', 3500000, '10023', 'user'),
('user2@example.com', '$2a$10$4WIo8M2rVBWg1.lhNEELrurjULjFe.HHrUFBX17pT8/Q1gCVpS74i', 'Trần Thị B', '0912345678', '789 Đường DEF, Quận 3, TP.HCM', 1200000, '20456', 'user'),
('user3@example.com', '$2a$10$4WIo8M2rVBWg1.lhNEELrurjULjFe.HHrUFBX17pT8/Q1gCVpS74i', 'Lê Văn C', '0923456789', '321 Đường GHI, Quận 4, TP.HCM', 4500000, '59877', 'user');

-- Thêm products mẫu
INSERT INTO products (name, description, price, stock, category_id, image, is_visible) VALUES
-- Điện thoại
('iPhone 15 Pro Max', 'iPhone 15 Pro Max 256GB, màn hình 6.7 inch, chip A17 Pro, camera 48MP', 29990000, 50, 1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', 1),
('Samsung Galaxy S24 Ultra', 'Samsung Galaxy S24 Ultra 512GB, màn hình 6.8 inch, bút S Pen, camera 200MP', 26990000, 30, 1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500', 1),
('Xiaomi 14 Pro', 'Xiaomi 14 Pro 256GB, màn hình 6.73 inch, chip Snapdragon 8 Gen 3', 19990000, 40, 1, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500', 1),
('OPPO Find X7', 'OPPO Find X7 256GB, màn hình 6.78 inch, camera Hasselblad', 17990000, 35, 1, 'https://images.unsplash.com/photo-1601972602237-8c79241f4707?w=500', 1),

-- Laptop
('MacBook Pro 16 inch M3', 'MacBook Pro 16 inch M3 Pro, 18GB RAM, 512GB SSD, màn hình Liquid Retina XDR', 59990000, 20, 2, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', 1),
('Dell XPS 15', 'Dell XPS 15 9530, Intel Core i7, 16GB RAM, 512GB SSD, màn hình OLED 15.6 inch', 39990000, 25, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', 1),
('ASUS ROG Strix G16', 'ASUS ROG Strix G16, Intel Core i9, RTX 4070, 16GB RAM, 1TB SSD', 42990000, 15, 2, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500', 1),
('Lenovo ThinkPad X1 Carbon', 'Lenovo ThinkPad X1 Carbon Gen 11, Intel Core i7, 16GB RAM, 512GB SSD', 34990000, 30, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', 1),

-- Phụ kiện
('AirPods Pro 2', 'Tai nghe không dây Apple AirPods Pro 2, chống ồn chủ động, MagSafe', 6990000, 100, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500', 1),
('Samsung Galaxy Buds2 Pro', 'Tai nghe không dây Samsung Galaxy Buds2 Pro, chống ồn chủ động', 3990000, 80, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500', 1),
('Ốp lưng iPhone 15 Pro Max', 'Ốp lưng trong suốt chống sốc cho iPhone 15 Pro Max', 299000, 200, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500', 1),
('Cáp sạc nhanh USB-C 100W', 'Cáp sạc nhanh USB-C to USB-C, hỗ trợ sạc 100W, dài 2m', 499000, 150, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500', 1),

-- Đồ gia dụng
('Máy lọc không khí Xiaomi', 'Máy lọc không khí Xiaomi Air Purifier 4, lọc HEPA, điều khiển app', 2990000, 40, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500', 1),
('Nồi cơm điện tử Tiger', 'Nồi cơm điện tử Tiger 1.8L, nấu cơm ngon, tiết kiệm điện', 1990000, 60, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500', 1),
('Máy xay sinh tố Philips', 'Máy xay sinh tố Philips HR2115, công suất 600W, 2 cối', 1490000, 50, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500', 1),
('Bàn ủi hơi nước Panasonic', 'Bàn ủi hơi nước Panasonic NI-E650, công suất 2400W', 1290000, 45, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500', 1),

-- Thời trang
('Áo thun nam basic', 'Áo thun nam chất liệu cotton 100%, nhiều màu sắc, size M-L-XL', 299000, 200, 5, 'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=500', 1),
('Quần jean nam', 'Quần jean nam form slim, chất liệu denim cao cấp, size 28-36', 899000, 150, 5, 'https://images.unsplash.com/photo-1542272604-787c403383bb?w=500', 1),
('Giày thể thao Nike', 'Giày thể thao Nike Air Max, size 38-44, nhiều màu', 2499000, 80, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 1),
('Túi xách nữ da thật', 'Túi xách nữ da thật, thiết kế sang trọng, nhiều màu sắc', 1999000, 60, 5, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500', 1),

-- Sách
('Sách: Đắc Nhân Tâm', 'Sách Đắc Nhân Tâm - Dale Carnegie, bản dịch tiếng Việt', 89000, 300, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', 1),
('Sách: Nhà Giả Kim', 'Sách Nhà Giả Kim - Paulo Coelho, bản dịch tiếng Việt', 99000, 250, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', 1),
('Sách: Clean Code', 'Sách Clean Code - Robert C. Martin, lập trình viên nên đọc', 199000, 100, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', 1),
('Sách: Tôi Tài Giỏi Bạn Cũng Thế', 'Sách Tôi Tài Giỏi Bạn Cũng Thế - Adam Khoo', 129000, 200, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', 1);

-- Thêm orders mẫu
INSERT INTO orders (user_id, total, shipping_address, payment_method, payment_gateway, status) VALUES
(2, 29990000, '456 Đường XYZ, Quận 2, TP.HCM', 'wallet', 'wallet', 'completed'),
(2, 6990000, '456 Đường XYZ, Quận 2, TP.HCM', 'wallet', 'wallet', 'shipped'),
(3, 19990000, '789 Đường DEF, Quận 3, TP.HCM', 'wallet', 'wallet', 'processing'),
(3, 2990000, '789 Đường DEF, Quận 3, TP.HCM', 'wallet', 'wallet', 'pending'),
(4, 59990000, '321 Đường GHI, Quận 4, TP.HCM', 'wallet', 'wallet', 'completed');

-- Thêm order_items mẫu
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- Order 1: user 2 mua iPhone 15 Pro Max
(1, 1, 1, 29990000),

-- Order 2: user 2 mua AirPods Pro 2
(2, 9, 1, 6990000),

-- Order 3: user 3 mua Xiaomi 14 Pro
(3, 3, 1, 19990000),

-- Order 4: user 3 mua máy lọc không khí
(4, 13, 1, 2990000),

-- Order 5: user 4 mua MacBook Pro
(5, 5, 1, 59990000);

-- Thêm dữ liệu nhập kho mẫu
INSERT INTO inventory_entries (product_id, product_name, product_image, quantity, unit_cost, total_cost, note, created_by, supplier_name, supplier_contact, supplier_email, supplier_address)
VALUES
(1, 'iPhone 15 Pro Max', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', 10, 25000000, 250000000, 'Nhập đợt mới từ Apple VN', 1, 'Apple Vietnam', '028-123456', 'dist@apple.com', 'Apple Park, HCM'),
(5, 'MacBook Pro 16 inch M3', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', 5, 52000000, 260000000, 'Bổ sung hàng MacBook', 1, 'FPT Trading', '028-22223333', 'sales@fpt.com', 'FPT Tower, Hà Nội'),
(9, 'AirPods Pro 2', 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500', 50, 5200000, 260000000, 'Tai nghe AirPods Pro 2', 1, 'CellphoneS Distribution', '028-77778888', 'order@cellphones.vn', '117 Trần Duy Hưng, Hà Nội');

-- Thêm giao dịch ví mẫu
INSERT INTO wallet_transactions (user_id, amount, method, type, note, status) VALUES
(2, 5000000, 'transfer', 'topup', 'Nạp tiền chuyển khoản', 'approved'),
(3, 3000000, 'transfer', 'topup', 'Nạp tiền chuyển khoản', 'approved'),
(4, 7000000, 'transfer', 'topup', 'Nạp tiền chuyển khoản', 'approved');

-- Thêm ảnh cho sản phẩm (product_images)
-- Mỗi sản phẩm có 3-5 ảnh trong gallery
INSERT INTO product_images (product_id, image_url, display_order) VALUES
-- iPhone 15 Pro Max (product_id = 1)
(1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', 0),
(1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 1),
(1, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800', 2),
(1, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800', 3),
(1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 4),
-- Samsung Galaxy S24 Ultra (product_id = 2)
(2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 0),
(2, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800', 1),
(2, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', 2),
(2, 'https://images.unsplash.com/photo-1523206489230-c012c64b2c48?w=800', 3),
-- Xiaomi 14 Pro (product_id = 3)
(3, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800', 0),
(3, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', 1),
(3, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 2),
(3, 'https://images.unsplash.com/photo-1601972602237-8c79241f4707?w=800', 3),
(3, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800', 4),
-- OPPO Find X7 (product_id = 4)
(4, 'https://images.unsplash.com/photo-1601972602237-8c79241f4707?w=800', 0),
(4, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', 1),
(4, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', 2),
-- MacBook Pro 16 inch M3 (product_id = 5)
(5, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 0),
(5, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 1),
(5, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', 2),
(5, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 3),
(5, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 4),
-- Dell XPS 15 (product_id = 6)
(6, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 0),
(6, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 1),
(6, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', 2),
(6, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 3),
-- ASUS ROG Strix G16 (product_id = 7)
(7, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', 0),
(7, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 1),
(7, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 2),
(7, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', 3),
(7, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', 4),
-- Lenovo ThinkPad X1 Carbon (product_id = 8)
(8, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', 0),
(8, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800', 1),
(8, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800', 2),
-- AirPods Pro 2 (product_id = 9)
(9, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800', 0),
(9, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 1),
(9, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800', 2),
(9, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800', 3),
(9, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800', 4),
-- Samsung Galaxy Buds2 Pro (product_id = 10)
(10, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800', 0),
(10, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 1),
(10, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800', 2),
-- Ốp lưng iPhone 15 Pro Max (product_id = 11)
(11, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800', 0),
(11, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 1),
(11, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800', 2),
(11, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800', 3),
-- Cáp sạc nhanh USB-C 100W (product_id = 12)
(12, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800', 0),
(12, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', 1),
(12, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800', 2),
-- Máy lọc không khí Xiaomi (product_id = 13)
(13, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 0),
(13, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', 1),
(13, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', 2),
(13, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 3),
(13, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', 4),
-- Nồi cơm điện tử Tiger (product_id = 14)
(14, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 0),
(14, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', 1),
(14, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', 2),
-- Máy xay sinh tố Philips (product_id = 15)
(15, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 0),
(15, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', 1),
(15, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', 2),
(15, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 3),
-- Bàn ủi hơi nước Panasonic (product_id = 16)
(16, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800', 0),
(16, 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800', 1),
(16, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800', 2),
-- Áo thun nam basic (product_id = 17)
(17, 'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=800', 0),
(17, 'https://images.unsplash.com/photo-1542272604-787c403383bb?w=800', 1),
(17, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 2),
(17, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800', 3),
-- Quần jean nam (product_id = 18)
(18, 'https://images.unsplash.com/photo-1542272604-787c403383bb?w=800', 0),
(18, 'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=800', 1),
(18, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 2),
-- Giày thể thao Nike (product_id = 19)
(19, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 0),
(19, 'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=800', 1),
(19, 'https://images.unsplash.com/photo-1542272604-787c403383bb?w=800', 2),
(19, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800', 3),
(19, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', 4),
-- Túi xách nữ da thật (product_id = 20)
(20, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800', 0),
(20, 'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=800', 1),
(20, 'https://images.unsplash.com/photo-1542272604-787c403383bb?w=800', 2),
-- Sách: Đắc Nhân Tâm (product_id = 21)
(21, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 0),
(21, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 1),
(21, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', 2),
(21, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 3),
-- Sách: Nhà Giả Kim (product_id = 22)
(22, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 0),
(22, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 1),
(22, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', 2),
-- Sách: Clean Code (product_id = 23)
(23, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 0),
(23, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 1),
(23, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', 2),
(23, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 3),
(23, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 4),
-- Sách: Tôi Tài Giỏi Bạn Cũng Thế (product_id = 24)
(24, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 0),
(24, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 1),
(24, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', 2);

-- Hiển thị thống kê
SELECT 'Dữ liệu mẫu đã được thêm thành công!' AS Message;
SELECT COUNT(*) AS 'Tổng số categories' FROM categories;
SELECT COUNT(*) AS 'Tổng số users' FROM users;
SELECT COUNT(*) AS 'Tổng số products' FROM products;
SELECT COUNT(*) AS 'Tổng số product_images' FROM product_images;
SELECT COUNT(*) AS 'Tổng số orders' FROM orders;

