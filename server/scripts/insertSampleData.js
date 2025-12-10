const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function insertSampleData() {
  try {
    console.log('🔄 Đang thêm dữ liệu mẫu...\n');

    // Xóa dữ liệu cũ
    console.log('🗑️  Đang xóa dữ liệu cũ...');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('TRUNCATE TABLE order_items');
    await pool.execute('TRUNCATE TABLE orders');
    await pool.execute('TRUNCATE TABLE product_images');
    await pool.execute('TRUNCATE TABLE products');
    await pool.execute('TRUNCATE TABLE categories');
    await pool.execute('TRUNCATE TABLE users');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Hash password cho tất cả users (password: password123)
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm categories với mô tả chi tiết hơn
    console.log('📁 Đang thêm categories...');
    const categories = [
      ['Điện thoại', 'Các loại điện thoại thông minh, smartphone cao cấp từ Apple, Samsung, Xiaomi, OPPO, Vivo và nhiều thương hiệu khác. Hỗ trợ 5G, camera chuyên nghiệp, pin lâu dùng.'],
      ['Laptop', 'Máy tính xách tay đa dạng: laptop gaming hiệu năng cao, laptop văn phòng, laptop đồ họa chuyên nghiệp. Từ các thương hiệu Apple, Dell, ASUS, Lenovo, HP.'],
      ['Phụ kiện', 'Phụ kiện công nghệ đầy đủ: tai nghe không dây, sạc nhanh, ốp lưng, cáp sạc, pin dự phòng, chuột, bàn phím, webcam và nhiều phụ kiện khác.'],
      ['Đồ gia dụng', 'Thiết bị gia dụng thông minh: máy lọc không khí, nồi cơm điện, máy xay sinh tố, bàn ủi, máy hút bụi, quạt điều hòa, máy nước nóng lạnh.'],
      ['Thời trang', 'Thời trang đa dạng: quần áo nam nữ, giày dép, túi xách, phụ kiện thời trang. Chất liệu cao cấp, thiết kế hiện đại, phù hợp mọi lứa tuổi.'],
      ['Sách', 'Sách đa dạng thể loại: sách văn học, sách kỹ thuật lập trình, sách kinh doanh, sách self-help, sách giáo khoa, truyện tranh, tiểu thuyết.']
    ];
    for (const [name, desc] of categories) {
      await pool.execute('INSERT INTO categories (name, description) VALUES (?, ?)', [name, desc]);
    }

    // Thêm users với thông tin đầy đủ hơn
    console.log('👥 Đang thêm users...');
    const users = [
      ['admin@shop.com', hashedPassword, 'Quản trị viên', '0123456789', '123 Đường Nguyễn Huệ, Quận 1, TP.HCM', 'admin'],
      ['user1@example.com', hashedPassword, 'Nguyễn Văn An', '0987654321', '456 Đường Lê Lợi, Quận 1, TP.HCM', 'user'],
      ['user2@example.com', hashedPassword, 'Trần Thị Bình', '0912345678', '789 Đường Nguyễn Trãi, Quận 5, TP.HCM', 'user'],
      ['user3@example.com', hashedPassword, 'Lê Văn Cường', '0923456789', '321 Đường Võ Văn Tần, Quận 3, TP.HCM', 'user'],
      ['user4@example.com', hashedPassword, 'Phạm Thị Dung', '0934567890', '654 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 'user'],
      ['user5@example.com', hashedPassword, 'Hoàng Văn Em', '0945678901', '987 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM', 'user'],
      ['user6@example.com', hashedPassword, 'Võ Thị Phương', '0956789012', '147 Đường Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM', 'user'],
      ['user7@example.com', hashedPassword, 'Đặng Văn Giang', '0967890123', '258 Đường Trường Chinh, Quận 12, TP.HCM', 'user']
    ];
    for (const [email, pwd, name, phone, address, role] of users) {
      await pool.execute(
        'INSERT INTO users (email, password, name, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
        [email, pwd, name, phone, address, role]
      );
    }

    // Thêm products với mô tả chi tiết và đa dạng hơn
    console.log('📦 Đang thêm products...');
    const products = [
      // Điện thoại (category_id = 1) - 15 sản phẩm
      ['iPhone 15 Pro Max 256GB', 'iPhone 15 Pro Max 256GB Titanium tự nhiên. Màn hình Super Retina XDR 6.7 inch, chip A17 Pro 3nm, camera chính 48MP với zoom quang học 5x, pin 4441mAh, sạc nhanh 27W, hỗ trợ 5G, chống nước IP68. Hộp đầy đủ phụ kiện, bảo hành chính hãng 12 tháng.', 29990000, 50, 1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
      ['iPhone 15 Pro 128GB', 'iPhone 15 Pro 128GB Titanium xanh. Màn hình Super Retina XDR 6.1 inch, chip A17 Pro, camera chính 48MP, zoom quang học 3x, pin 3274mAh, sạc nhanh 20W, hỗ trợ 5G, chống nước IP68. Thiết kế nhỏ gọn, phù hợp một tay.', 24990000, 60, 1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
      ['iPhone 14 Pro Max 512GB', 'iPhone 14 Pro Max 512GB màu tím. Màn hình Super Retina XDR 6.7 inch, chip A16 Bionic, camera chính 48MP, Dynamic Island, pin 4323mAh, sạc nhanh 27W, hỗ trợ 5G, chống nước IP68. Giá tốt, hiệu năng mạnh mẽ.', 26990000, 45, 1, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
      ['Samsung Galaxy S24 Ultra 512GB', 'Samsung Galaxy S24 Ultra 512GB màu đen. Màn hình Dynamic AMOLED 2X 6.8 inch 120Hz, chip Snapdragon 8 Gen 3, camera chính 200MP, bút S Pen, pin 5000mAh, sạc nhanh 45W, hỗ trợ 5G, chống nước IP68. Hiệu năng đỉnh cao cho người dùng chuyên nghiệp.', 26990000, 30, 1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],
      ['Samsung Galaxy S24+ 256GB', 'Samsung Galaxy S24+ 256GB màu xanh. Màn hình Dynamic AMOLED 2X 6.7 inch 120Hz, chip Snapdragon 8 Gen 3, camera chính 50MP, pin 4900mAh, sạc nhanh 45W, hỗ trợ 5G, chống nước IP68. Cân bằng giữa hiệu năng và giá cả.', 19990000, 40, 1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],
      ['Xiaomi 14 Pro 256GB', 'Xiaomi 14 Pro 256GB màu đen. Màn hình AMOLED 6.73 inch 120Hz, chip Snapdragon 8 Gen 3, camera Leica 50MP, pin 4880mAh, sạc nhanh 120W có dây + 50W không dây, hỗ trợ 5G, chống nước IP68. Sạc siêu nhanh, camera Leica chuyên nghiệp.', 19990000, 40, 1, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500'],
      ['Xiaomi 14 128GB', 'Xiaomi 14 128GB màu trắng. Màn hình AMOLED 6.36 inch 120Hz, chip Snapdragon 8 Gen 3, camera Leica 50MP, pin 4610mAh, sạc nhanh 90W, hỗ trợ 5G, chống nước IP68. Thiết kế nhỏ gọn, hiệu năng mạnh mẽ.', 14990000, 55, 1, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500'],
      ['OPPO Find X7 Ultra 256GB', 'OPPO Find X7 Ultra 256GB màu xanh. Màn hình AMOLED 6.78 inch 120Hz, chip Snapdragon 8 Gen 3, camera Hasselblad 50MP + 50MP tele, pin 5000mAh, sạc nhanh 100W, hỗ trợ 5G, chống nước IP68. Camera Hasselblad chuyên nghiệp, sạc siêu nhanh.', 17990000, 35, 1, 'https://images.unsplash.com/photo-1601972602237-8c79241f4707?w=500'],
      ['OPPO Find X7 256GB', 'OPPO Find X7 256GB màu đen. Màn hình AMOLED 6.78 inch 120Hz, chip MediaTek Dimensity 9300, camera Hasselblad 50MP, pin 5000mAh, sạc nhanh 100W, hỗ trợ 5G, chống nước IP68. Giá tốt, camera chất lượng.', 14990000, 50, 1, 'https://images.unsplash.com/photo-1601972602237-8c79241f4707?w=500'],
      ['Vivo X100 Pro 256GB', 'Vivo X100 Pro 256GB màu xanh. Màn hình AMOLED 6.78 inch 120Hz, chip MediaTek Dimensity 9300, camera Zeiss 50MP, pin 5400mAh, sạc nhanh 120W, hỗ trợ 5G, chống nước IP68. Camera Zeiss chuyên nghiệp, pin lớn.', 16990000, 30, 1, 'https://images.unsplash.com/photo-1601972602237-8c79241f4707?w=500'],
      ['OnePlus 12 256GB', 'OnePlus 12 256GB màu đen. Màn hình AMOLED 6.82 inch 120Hz, chip Snapdragon 8 Gen 3, camera Hasselblad 50MP, pin 5400mAh, sạc nhanh 100W, hỗ trợ 5G, chống nước IP65. Hiệu năng mạnh, sạc nhanh.', 15990000, 35, 1, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500'],
      ['Realme GT 5 Pro 256GB', 'Realme GT 5 Pro 256GB màu cam. Màn hình AMOLED 6.78 inch 144Hz, chip Snapdragon 8 Gen 3, camera 50MP, pin 5400mAh, sạc nhanh 100W, hỗ trợ 5G, chống nước IP64. Gaming phone, hiệu năng đỉnh cao.', 12990000, 40, 1, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500'],
      ['Google Pixel 8 Pro 256GB', 'Google Pixel 8 Pro 256GB màu xanh. Màn hình LTPO OLED 6.7 inch 120Hz, chip Google Tensor G3, camera 50MP với AI, pin 5050mAh, sạc nhanh 30W, hỗ trợ 5G, chống nước IP68. Camera AI tốt nhất, phần mềm Google thuần.', 19990000, 25, 1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],
      ['Nothing Phone 2 256GB', 'Nothing Phone 2 256GB màu trắng. Màn hình AMOLED 6.7 inch 120Hz, chip Snapdragon 8+ Gen 1, camera 50MP, pin 4700mAh, sạc nhanh 45W, hỗ trợ 5G, chống nước IP54. Thiết kế độc đáo với Glyph Interface.', 12990000, 30, 1, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500'],
      ['Samsung Galaxy A54 128GB', 'Samsung Galaxy A54 128GB màu tím. Màn hình Super AMOLED 6.4 inch 120Hz, chip Exynos 1380, camera 50MP, pin 5000mAh, sạc nhanh 25W, hỗ trợ 5G, chống nước IP67. Giá tốt, camera chất lượng.', 8990000, 80, 1, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],

      // Laptop (category_id = 2) - 12 sản phẩm
      ['MacBook Pro 16 inch M3 Pro', 'MacBook Pro 16 inch M3 Pro, 18GB RAM, 512GB SSD, màn hình Liquid Retina XDR 16.2 inch, chip M3 Pro 12-core CPU/18-core GPU, pin 100Wh, sạc MagSafe 3, webcam 1080p, 6 loa, Touch ID. Hiệu năng đỉnh cao cho chuyên gia.', 59990000, 20, 2, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
      ['MacBook Pro 14 inch M3', 'MacBook Pro 14 inch M3, 8GB RAM, 512GB SSD, màn hình Liquid Retina XDR 14.2 inch, chip M3 8-core CPU/10-core GPU, pin 70Wh, sạc MagSafe 3, webcam 1080p, 6 loa, Touch ID. Cân bằng giữa hiệu năng và di động.', 42990000, 30, 2, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
      ['MacBook Air 15 inch M3', 'MacBook Air 15 inch M3, 8GB RAM, 256GB SSD, màn hình Liquid Retina 15.3 inch, chip M3 8-core CPU/8-core GPU, pin 66.5Wh, sạc MagSafe 3, webcam 1080p, 6 loa, Touch ID. Mỏng nhẹ, pin lâu.', 34990000, 35, 2, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500'],
      ['Dell XPS 15 9530', 'Dell XPS 15 9530, Intel Core i7-13700H, 16GB RAM, 512GB SSD, màn hình OLED 15.6 inch 3.5K, RTX 4050 6GB, pin 86Wh, webcam 1080p, bàn phím backlit. Màn hình OLED tuyệt đẹp.', 39990000, 25, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      ['Dell XPS 13 Plus', 'Dell XPS 13 Plus, Intel Core i7-1360P, 16GB RAM, 512GB SSD, màn hình OLED 13.4 inch 4K, pin 55Wh, webcam 1080p, bàn phím backlit, thiết kế siêu mỏng. Ultrabook cao cấp.', 29990000, 30, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      ['ASUS ROG Strix G16', 'ASUS ROG Strix G16, Intel Core i9-13980HX, RTX 4070 8GB, 16GB RAM, 1TB SSD, màn hình IPS 16 inch 165Hz, pin 90Wh, bàn phím RGB, webcam 720p. Gaming laptop đỉnh cao.', 42990000, 15, 2, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'],
      ['ASUS ROG Zephyrus G14', 'ASUS ROG Zephyrus G14, AMD Ryzen 9 7940HS, RTX 4060 8GB, 16GB RAM, 1TB SSD, màn hình IPS 14 inch 165Hz, pin 76Wh, bàn phím RGB, webcam 1080p. Gaming laptop nhỏ gọn.', 34990000, 20, 2, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'],
      ['Lenovo ThinkPad X1 Carbon Gen 11', 'Lenovo ThinkPad X1 Carbon Gen 11, Intel Core i7-1355U, 16GB RAM, 512GB SSD, màn hình IPS 14 inch 2.8K, pin 57Wh, webcam 1080p, bàn phím backlit, vân tay. Laptop doanh nhân cao cấp.', 34990000, 30, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      ['Lenovo Legion Pro 7i', 'Lenovo Legion Pro 7i, Intel Core i9-13900HX, RTX 4080 12GB, 32GB RAM, 1TB SSD, màn hình IPS 16 inch 240Hz, pin 99.9Wh, bàn phím RGB, webcam 1080p. Gaming laptop flagship.', 54990000, 12, 2, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'],
      ['HP Spectre x360 14', 'HP Spectre x360 14, Intel Core i7-1355U, 16GB RAM, 512GB SSD, màn hình OLED 14 inch 2.8K touch, pin 66Wh, webcam 5MP, bàn phím backlit, vân tay. 2-in-1 cao cấp.', 32990000, 25, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500'],
      ['HP Victus 16', 'HP Victus 16, AMD Ryzen 7 7840HS, RTX 4060 8GB, 16GB RAM, 512GB SSD, màn hình IPS 16.1 inch 144Hz, pin 83Wh, bàn phím backlit, webcam 720p. Gaming laptop giá tốt.', 24990000, 35, 2, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'],
      ['MSI Stealth 16 Studio', 'MSI Stealth 16 Studio, Intel Core i9-13900H, RTX 4070 8GB, 32GB RAM, 1TB SSD, màn hình IPS 16 inch 240Hz, pin 99.9Wh, bàn phím RGB, webcam 1080p. Laptop đồ họa chuyên nghiệp.', 49990000, 18, 2, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500'],

      // Phụ kiện (category_id = 3) - 15 sản phẩm
      ['AirPods Pro 2 (USB-C)', 'Tai nghe không dây Apple AirPods Pro 2 với cổng USB-C. Chống ồn chủ động (ANC), không gian âm thanh (Spatial Audio), pin 6h + hộp 30h, sạc MagSafe, chống nước IPX4, chip H2. Âm thanh chất lượng cao.', 6990000, 100, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['AirPods Max', 'Tai nghe over-ear Apple AirPods Max. Chống ồn chủ động, không gian âm thanh, pin 20h, sạc Lightning, chip H1, 5 micro, thiết kế cao cấp. Trải nghiệm âm thanh tuyệt vời.', 12990000, 40, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Samsung Galaxy Buds2 Pro', 'Tai nghe không dây Samsung Galaxy Buds2 Pro. Chống ồn chủ động 360 Audio, pin 8h + hộp 29h, sạc không dây, chống nước IPX7, âm thanh 24-bit. Tương thích tốt với Samsung.', 3990000, 80, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Sony WH-1000XM5', 'Tai nghe over-ear Sony WH-1000XM5. Chống ồn chủ động hàng đầu, pin 30h, sạc nhanh 3 phút = 3 giờ, chống nước, âm thanh Hi-Res. Chống ồn tốt nhất thế giới.', 8990000, 50, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Ốp lưng iPhone 15 Pro Max MagSafe', 'Ốp lưng trong suốt chống sốc cho iPhone 15 Pro Max, hỗ trợ MagSafe, bảo vệ 4 góc, chống trầy xước, thiết kế mỏng nhẹ. Bảo vệ toàn diện.', 299000, 200, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Ốp lưng iPhone 15 Pro MagSafe', 'Ốp lưng da thật cho iPhone 15 Pro, hỗ trợ MagSafe, bảo vệ cao cấp, thiết kế sang trọng, nhiều màu sắc. Chất liệu da thật.', 599000, 150, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Cáp sạc nhanh USB-C 100W', 'Cáp sạc nhanh USB-C to USB-C, hỗ trợ sạc 100W, truyền dữ liệu USB 3.1, dài 2m, bền chắc, chống đứt. Sạc nhanh cho laptop và điện thoại.', 499000, 150, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Cáp sạc Lightning 2m', 'Cáp sạc Lightning to USB-C, dài 2m, hỗ trợ sạc nhanh, bền chắc, chống đứt, tương thích iPhone/iPad. Chất lượng cao.', 299000, 200, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Sạc không dây MagSafe 15W', 'Sạc không dây MagSafe 15W cho iPhone, thiết kế gọn nhẹ, sạc nhanh, LED báo pin, tương thích iPhone 12 trở lên. Tiện lợi.', 1290000, 100, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Pin dự phòng 20000mAh', 'Pin dự phòng 20000mAh, sạc nhanh 22.5W, 2 cổng USB-A + 1 cổng USB-C, LED báo pin, thiết kế mỏng nhẹ. Pin lớn, sạc nhanh.', 899000, 120, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Chuột không dây Logitech MX Master 3S', 'Chuột không dây Logitech MX Master 3S, cảm biến 8K DPI, pin 70 ngày, kết nối Bluetooth + USB, 7 nút, cuộn MagSpeed. Chuột văn phòng tốt nhất.', 2499000, 60, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Bàn phím cơ Keychron K8', 'Bàn phím cơ Keychron K8, switch Gateron Brown, layout 87 phím, kết nối Bluetooth + USB-C, LED RGB, pin 4000mAh. Bàn phím cơ chất lượng.', 2999000, 50, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Webcam Logitech C920 HD', 'Webcam Logitech C920 HD 1080p, micro kép, tự động lấy nét, tương thích Windows/Mac, thiết kế gọn nhẹ. Webcam chất lượng cho họp online.', 2499000, 70, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Giá đỡ laptop nhôm', 'Giá đỡ laptop nhôm cao cấp, điều chỉnh độ cao, tản nhiệt tốt, thiết kế gọn nhẹ, phù hợp mọi kích thước laptop. Ergonomics tốt.', 399000, 150, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],
      ['Hub USB-C 7-in-1', 'Hub USB-C 7-in-1: 3x USB 3.0, HDMI 4K, SD/TF card reader, PD 100W, thiết kế nhôm, tương thích MacBook/iPad. Mở rộng cổng tiện lợi.', 1299000, 80, 3, 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500'],

      // Đồ gia dụng (category_id = 4) - 12 sản phẩm
      ['Máy lọc không khí Xiaomi Air Purifier 4', 'Máy lọc không khí Xiaomi Air Purifier 4, lọc HEPA H13, diện tích 48m², điều khiển app, hiển thị PM2.5, chế độ ngủ yên tĩnh. Lọc không khí hiệu quả.', 2990000, 40, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Máy lọc không khí Sharp FP-J60E-W', 'Máy lọc không khí Sharp FP-J60E-W, công nghệ Plasmacluster, diện tích 42m², lọc HEPA, ion âm, điều khiển từ xa. Công nghệ Plasmacluster độc quyền.', 3990000, 30, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Nồi cơm điện tử Tiger JKT-D10', 'Nồi cơm điện tử Tiger JKT-D10 1.8L, nấu cơm ngon, tiết kiệm điện, chống dính, hẹn giờ, giữ ấm. Nồi cơm chất lượng Nhật Bản.', 1990000, 60, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Nồi cơm điện tử Panasonic SR-AB18', 'Nồi cơm điện tử Panasonic SR-AB18 1.8L, công nghệ Fuzzy Logic, nấu cơm ngon, tiết kiệm điện, chống dính, hẹn giờ. Công nghệ Fuzzy Logic thông minh.', 1790000, 65, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Máy xay sinh tố Philips HR2115', 'Máy xay sinh tố Philips HR2115, công suất 600W, 2 cối (1.5L + 0.5L), lưỡi dao thép không gỉ, chống tràn, dễ vệ sinh. Xay mịn, bền chắc.', 1490000, 50, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Máy xay sinh tố Sunhouse SHD5339', 'Máy xay sinh tố Sunhouse SHD5339, công suất 1000W, 2 cối (1.5L + 0.5L), lưỡi dao 6 cánh, chống tràn, thiết kế hiện đại. Công suất mạnh, giá tốt.', 899000, 70, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Bàn ủi hơi nước Panasonic NI-E650', 'Bàn ủi hơi nước Panasonic NI-E650, công suất 2400W, phun hơi nước, chống dính, tự động tắt, bảo hành 2 năm. Ủi nhanh, hiệu quả.', 1290000, 45, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Bàn ủi hơi nước Philips GC5030', 'Bàn ủi hơi nước Philips GC5030, công suất 2600W, phun hơi nước mạnh, chống dính, tự động tắt, thiết kế gọn nhẹ. Công suất cao.', 1490000, 40, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Máy hút bụi cầm tay Dyson V15', 'Máy hút bụi cầm tay Dyson V15 Detect, pin 60 phút, công nghệ laser, lọc HEPA, 5 chế độ, không dây, sạc nhanh. Công nghệ laser độc đáo.', 12990000, 20, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Máy hút bụi Xiaomi G10', 'Máy hút bụi cầm tay Xiaomi G10, pin 60 phút, lọc HEPA, 4 chế độ, không dây, sạc nhanh, điều khiển app. Giá tốt, chất lượng.', 3990000, 35, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Quạt điều hòa Sunhouse SHD7726', 'Quạt điều hòa Sunhouse SHD7726, công suất 65W, dung tích bình nước 7L, 3 tốc độ, điều khiển từ xa, làm mát hiệu quả. Làm mát không khí.', 1990000, 50, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
      ['Máy nước nóng lạnh Kangaroo KG40A1', 'Máy nước nóng lạnh Kangaroo KG40A1, dung tích 4L, làm nóng 95°C, làm lạnh 10°C, tiết kiệm điện, an toàn. Tiện lợi cho gia đình.', 2490000, 40, 4, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],

      // Thời trang (category_id = 5) - 12 sản phẩm
      ['Áo thun nam basic cotton', 'Áo thun nam chất liệu cotton 100%, co giãn tốt, thấm hút mồ hôi, nhiều màu sắc (đen, trắng, xám, xanh), size M-L-XL-XXL. Thoáng mát, bền đẹp.', 299000, 200, 5, 'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=500'],
      ['Áo sơ mi nam công sở', 'Áo sơ mi nam công sở, chất liệu cotton 65%/polyester 35%, form slim, cổ áo cứng, nhiều màu sắc, size S-M-L-XL. Lịch sự, chuyên nghiệp.', 599000, 150, 5, 'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=500'],
      ['Quần jean nam form slim', 'Quần jean nam form slim, chất liệu denim cao cấp 98% cotton, co giãn tốt, nhiều màu (xanh đậm, xanh nhạt, đen), size 28-36. Thời trang, bền đẹp.', 899000, 150, 5, 'https://images.unsplash.com/photo-1542272604-787c403383bb?w=500'],
      ['Quần tây nam công sở', 'Quần tây nam công sở, chất liệu polyester cao cấp, form slim, không nhăn, nhiều màu (đen, xám, navy), size 28-36. Lịch sự, chuyên nghiệp.', 799000, 120, 5, 'https://images.unsplash.com/photo-1542272604-787c403383bb?w=500'],
      ['Giày thể thao Nike Air Max 90', 'Giày thể thao Nike Air Max 90, công nghệ Air Max, đế cao su bền, nhiều màu sắc, size 38-44, chính hãng. Thoải mái, bền đẹp.', 2499000, 80, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
      ['Giày thể thao Adidas Ultraboost 22', 'Giày thể thao Adidas Ultraboost 22, công nghệ Boost, đế Continental, nhiều màu sắc, size 38-44, chính hãng. Năng lượng đàn hồi tốt.', 3299000, 60, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
      ['Túi xách nữ da thật', 'Túi xách nữ da thật, thiết kế sang trọng, nhiều ngăn, quai đeo vai + tay cầm, nhiều màu sắc (đen, nâu, đỏ). Chất liệu da thật cao cấp.', 1999000, 60, 5, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500'],
      ['Ví da nam cao cấp', 'Ví da nam cao cấp, da thật, nhiều ngăn thẻ, ngăn tiền, thiết kế gọn nhẹ, nhiều màu sắc (đen, nâu). Chất liệu da thật bền đẹp.', 899000, 100, 5, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500'],
      ['Áo khoác gió nam', 'Áo khoác gió nam, chống nước, chống gió, thấm hút mồ hôi, có mũ, nhiều màu sắc, size M-L-XL-XXL. Nhẹ, gọn, tiện lợi.', 699000, 80, 5, 'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=500'],
      ['Đồng hồ thông minh Apple Watch Series 9', 'Đồng hồ thông minh Apple Watch Series 9 45mm, màn hình Retina, chip S9, pin 18h, đo nhịp tim, GPS, chống nước 50m. Đồng hồ thông minh hàng đầu.', 8990000, 40, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
      ['Đồng hồ thông minh Samsung Galaxy Watch 6', 'Đồng hồ thông minh Samsung Galaxy Watch 6 44mm, màn hình AMOLED, chip Exynos, pin 40h, đo nhịp tim, GPS, chống nước 50m. Tương thích tốt với Samsung.', 5990000, 50, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
      ['Kính mát Ray-Ban Aviator', 'Kính mát Ray-Ban Aviator, tròng chống tia UV 100%, gọng kim loại, nhiều màu sắc, chính hãng. Thời trang, bảo vệ mắt.', 2990000, 60, 5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],

      // Sách (category_id = 6) - 12 sản phẩm
      ['Sách: Đắc Nhân Tâm - Dale Carnegie', 'Sách Đắc Nhân Tâm - Dale Carnegie, bản dịch tiếng Việt, bìa cứng, 320 trang. Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử. Bản dịch chất lượng cao.', 89000, 300, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Nhà Giả Kim - Paulo Coelho', 'Sách Nhà Giả Kim - Paulo Coelho, bản dịch tiếng Việt, bìa mềm, 192 trang. Câu chuyện truyền cảm hứng về hành trình tìm kiếm ước mơ. Bản dịch hay.', 99000, 250, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Clean Code - Robert C. Martin', 'Sách Clean Code - Robert C. Martin, bản tiếng Anh, bìa mềm, 464 trang. Cuốn sách bắt buộc cho mọi lập trình viên. Dạy cách viết code sạch và dễ đọc.', 199000, 100, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Tôi Tài Giỏi Bạn Cũng Thế - Adam Khoo', 'Sách Tôi Tài Giỏi Bạn Cũng Thế - Adam Khoo, bản dịch tiếng Việt, bìa mềm, 256 trang. Phương pháp học tập hiệu quả, truyền cảm hứng. Phù hợp học sinh, sinh viên.', 129000, 200, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Sapiens - Yuval Noah Harari', 'Sách Sapiens - Lược sử loài người - Yuval Noah Harari, bản dịch tiếng Việt, bìa cứng, 512 trang. Lịch sử loài người từ thời đồ đá đến hiện đại. Cuốn sách bestseller.', 199000, 150, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Atomic Habits - James Clear', 'Sách Atomic Habits - Thay đổi nhỏ tạo nên khác biệt lớn - James Clear, bản dịch tiếng Việt, bìa mềm, 320 trang. Xây dựng thói quen tốt, phá bỏ thói quen xấu. Thực hành được ngay.', 149000, 180, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: The Pragmatic Programmer', 'Sách The Pragmatic Programmer - Your Journey to Mastery, bản tiếng Anh, bìa mềm, 352 trang. Cuốn sách kinh điển về phát triển phần mềm. Dành cho lập trình viên chuyên nghiệp.', 249000, 80, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Dế Mèn Phiêu Lưu Ký - Tô Hoài', 'Sách Dế Mèn Phiêu Lưu Ký - Tô Hoài, bản in mới, bìa cứng, 200 trang. Tác phẩm văn học thiếu nhi kinh điển Việt Nam. Phù hợp mọi lứa tuổi.', 79000, 250, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Harry Potter và Hòn đá Phù thủy', 'Sách Harry Potter và Hòn đá Phù thủy - J.K. Rowling, bản dịch tiếng Việt, bìa cứng, 320 trang. Tập đầu tiên của series Harry Potter. Bản dịch chất lượng.', 149000, 200, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Tư duy nhanh và chậm - Daniel Kahneman', 'Sách Tư duy nhanh và chậm - Daniel Kahneman, bản dịch tiếng Việt, bìa mềm, 612 trang. Giải Nobel Kinh tế, nghiên cứu về tư duy con người. Cuốn sách khoa học hay.', 199000, 120, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Đại học không lạc hướng - Nguyễn Ngọc Thạch', 'Sách Đại học không lạc hướng - Nguyễn Ngọc Thạch, bìa mềm, 240 trang. Hành trang cho sinh viên, định hướng tương lai. Phù hợp sinh viên năm nhất.', 99000, 180, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'],
      ['Sách: Rich Dad Poor Dad - Robert Kiyosaki', 'Sách Rich Dad Poor Dad - Cha giàu cha nghèo - Robert Kiyosaki, bản dịch tiếng Việt, bìa mềm, 336 trang. Giáo dục tài chính, tư duy làm giàu. Cuốn sách bestseller về tài chính.', 149000, 160, 6, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500']
    ];
    const productIds = [];
    for (const [name, desc, price, stock, catId, image] of products) {
      const [result] = await pool.execute(
        'INSERT INTO products (name, description, price, stock, category_id, image, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, desc, price, stock, catId, image, 1]
      );
      productIds.push({ id: result.insertId, categoryId: catId, name });
    }

    // Thêm nhiều ảnh cho mỗi sản phẩm
    console.log('🖼️  Đang thêm ảnh cho sản phẩm...');
    
    // Hàm tạo danh sách ảnh dựa trên category
    const getProductImages = (categoryId, productName) => {
      const allImages = {
        1: [ // Điện thoại
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800',
          'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800',
          'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
          'https://images.unsplash.com/photo-1601972602237-8c79241f4707?w=800',
          'https://images.unsplash.com/photo-1523206489230-c012c64b2c48?w=800'
        ],
        2: [ // Laptop
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
          'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
        ],
        3: [ // Phụ kiện
          'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800',
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
          'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800'
        ],
        4: [ // Đồ gia dụng
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800',
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800',
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'
        ],
        5: [ // Thời trang
          'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=800',
          'https://images.unsplash.com/photo-1542272604-787c403383bb?w=800',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
          'https://images.unsplash.com/photo-1521572163474-6864f9cf04ab?w=800',
          'https://images.unsplash.com/photo-1542272604-787c403383bb?w=800'
        ],
        6: [ // Sách
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800'
        ]
      };
      
      const images = allImages[categoryId] || allImages[1];
      const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 ảnh
      
      // Trộn ngẫu nhiên và lấy số lượng cần thiết
      const shuffled = images.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, numImages);
    };

    // Thêm ảnh cho mỗi sản phẩm
    for (const product of productIds) {
      const images = getProductImages(product.categoryId, product.name);
      for (let i = 0; i < images.length; i++) {
        await pool.execute(
          'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
          [product.id, images[i], i]
        );
      }
    }

    // Thêm orders với nhiều sản phẩm hơn
    console.log('📋 Đang thêm orders...');
    const orders = [
      [2, 29990000, '456 Đường Lê Lợi, Quận 1, TP.HCM', 'wallet', 'wallet', 'completed'],
      [2, 6990000, '456 Đường Lê Lợi, Quận 1, TP.HCM', 'wallet', 'wallet', 'shipped'],
      [3, 19990000, '789 Đường Nguyễn Trãi, Quận 5, TP.HCM', 'wallet', 'wallet', 'processing'],
      [3, 2990000, '789 Đường Nguyễn Trãi, Quận 5, TP.HCM', 'wallet', 'wallet', 'pending'],
      [4, 59990000, '321 Đường Võ Văn Tần, Quận 3, TP.HCM', 'wallet', 'wallet', 'completed'],
      [4, 2499000, '321 Đường Võ Văn Tần, Quận 3, TP.HCM', 'wallet', 'wallet', 'completed'],
      [5, 3990000, '654 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 'wallet', 'wallet', 'shipped'],
      [5, 1299000, '654 Đường Điện Biên Phủ, Quận Bình Thạnh, TP.HCM', 'wallet', 'wallet', 'processing'],
      [6, 14990000, '987 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM', 'wallet', 'wallet', 'completed'],
      [6, 899000, '987 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM', 'wallet', 'wallet', 'pending'],
      [7, 42990000, '147 Đường Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM', 'wallet', 'wallet', 'shipped'],
      [7, 199000, '147 Đường Hoàng Văn Thụ, Quận Phú Nhuận, TP.HCM', 'wallet', 'wallet', 'completed']
    ];
    for (const [userId, total, address, paymentMethod, paymentGateway, status] of orders) {
      await pool.execute(
        'INSERT INTO orders (user_id, total, shipping_address, payment_method, payment_gateway, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, total, address, paymentMethod, paymentGateway, status]
      );
    }

    // Thêm order_items với nhiều sản phẩm đa dạng
    console.log('🛒 Đang thêm order items...');
    const orderItems = [
      [1, 1, 1, 29990000], // Order 1: iPhone 15 Pro Max
      [2, 9, 1, 6990000],  // Order 2: AirPods Pro 2
      [3, 6, 1, 19990000], // Order 3: Xiaomi 14 Pro
      [4, 13, 1, 2990000], // Order 4: Máy lọc không khí
      [5, 5, 1, 59990000], // Order 5: MacBook Pro 16 inch
      [6, 20, 1, 2499000], // Order 6: Giày Nike
      [7, 10, 1, 3990000], // Order 7: Samsung Galaxy Buds2 Pro
      [8, 25, 1, 1299000], // Order 8: Sạc không dây MagSafe
      [9, 7, 1, 14990000], // Order 9: Xiaomi 14
      [10, 30, 1, 899000], // Order 10: Pin dự phòng
      [11, 6, 1, 42990000], // Order 11: ASUS ROG Strix G16
      [12, 33, 1, 199000]  // Order 12: Sách Clean Code
    ];
    for (const [orderId, productId, qty, price] of orderItems) {
      await pool.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, productId, qty, price]
      );
    }

    // Hiển thị thống kê
    const [categoriesCount] = await pool.execute('SELECT COUNT(*) as count FROM categories');
    const [usersCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [productsCount] = await pool.execute('SELECT COUNT(*) as count FROM products');
    const [ordersCount] = await pool.execute('SELECT COUNT(*) as count FROM orders');
    const [imagesCount] = await pool.execute('SELECT COUNT(*) as count FROM product_images');

    console.log('\n✅ Đã thêm dữ liệu mẫu thành công!\n');
    console.log('📊 Thống kê:');
    console.log(`   - Categories: ${categoriesCount[0].count}`);
    console.log(`   - Users: ${usersCount[0].count}`);
    console.log(`   - Products: ${productsCount[0].count}`);
    console.log(`   - Product Images: ${imagesCount[0].count} (trung bình ${Math.round(imagesCount[0].count / productsCount[0].count)} ảnh/sản phẩm)`);
    console.log(`   - Orders: ${ordersCount[0].count}`);
    console.log('\n💡 Tài khoản đăng nhập:');
    console.log('   Admin:');
    console.log('     Email: admin@shop.com');
    console.log('     Password: password123');
    console.log('   Users:');
    console.log('     Email: user1@example.com đến user7@example.com');
    console.log('     Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi thêm dữ liệu mẫu:', error.message);
    console.error(error);
    process.exit(1);
  }
}

insertSampleData();
