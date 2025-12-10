# Giải thích chi tiết schema SQL

Tài liệu này phân tích cấu trúc database trong `server/database/schema.sql`: mục đích từng bảng, các khóa, ràng buộc và lưu ý migration.

## Tổng quan
- Database: `shopweb_db`.
- Chuẩn hóa mức cơ bản: tách `users`, `products`, `categories`, `orders`, `order_items`, `product_images`, `inventory_entries`, `wallet_transactions`.
- Khóa ngoại được thiết lập với hành vi `ON DELETE` phù hợp nghiệp vụ (xóa/ghi nhận null/cascade).

## Bảng chi tiết

### `users`
- Mục đích: lưu thông tin đăng nhập và hồ sơ người dùng.
- Cột chính: `id` (PK).
- Trường quan trọng:
  - `email` UNIQUE, `password` (bcrypt hash), `name`, `phone`, `address`.
  - `balance` DECIMAL(12,2) cho ví.
  - `customer_code` CHAR(5) UNIQUE: mã khách hàng ngắn gọn.
  - `role` ENUM('user','admin') cho phân quyền.
- Tự động thời gian: `created_at`, `updated_at`.

### `categories`
- Mục đích: phân loại sản phẩm.
- Cột chính: `id` (PK), `name`, `description`, timestamps.

### `products`
- Mục đích: lưu sản phẩm.
- Cột chính: `id` (PK).
- Trường chính: `name`, `description`, `price` DECIMAL(10,2), `stock` (tồn kho), `image` (ảnh đại diện), `is_visible` (ẩn/hiện).
- Quan hệ: `category_id` -> `categories(id)` với `ON DELETE SET NULL` (xóa category không xóa sản phẩm, chỉ bỏ liên kết).
- Timestamp: `created_at`, `updated_at`.

### `product_images`
- Mục đích: hỗ trợ nhiều ảnh cho mỗi sản phẩm.
- Cột chính: `id` (PK).
- Trường chính: `product_id` (FK), `image_url`, `display_order` (thứ tự hiển thị).
- Chỉ mục: `idx_product_id`, `idx_display_order` để tối ưu truy vấn ảnh theo sản phẩm và thứ tự.
- Quan hệ: `product_id` -> `products(id)` với `ON DELETE CASCADE` (xóa sản phẩm sẽ xóa ảnh).

### `orders`
- Mục đích: đơn hàng khách.
- Cột chính: `id` (PK).
- Trường chính:
  - `user_id` (FK), `total` DECIMAL(12,2) (đã nâng từ 10,2), `shipping_address`.
  - Thanh toán: `payment_method`, `payment_gateway` dạng VARCHAR(50) (đổi từ ENUM để hỗ trợ `wallet` và mở rộng).
  - `status` ENUM: pending/processing/shipped/completed/cancelled.
- Quan hệ: `user_id` -> `users(id)` `ON DELETE CASCADE` (xóa user sẽ xóa đơn).
- Timestamp: `created_at`, `updated_at`.

### `order_items`
- Mục đích: chi tiết từng sản phẩm trong đơn.
- Cột chính: `id` (PK).
- Trường chính: `order_id` (FK), `product_id` (FK), `quantity`, `price` (giá tại thời điểm mua).
- Quan hệ: 
  - `order_id` -> `orders(id)` `ON DELETE CASCADE` (xóa đơn xóa dòng).
  - `product_id` -> `products(id)` `ON DELETE CASCADE` (xóa sản phẩm xóa dòng; phù hợp dữ liệu phát triển, nếu cần lưu vết lịch sử có thể cân nhắc SET NULL).

### `inventory_entries`
- Mục đích: nhật ký nhập kho/mua hàng từ nhà cung cấp.
- Cột chính: `id` (PK).
- Trường chính: `product_id` (FK, có thể null), `product_name`, `product_image`, `quantity`, `unit_cost`, `total_cost`, `note`.
- Nhà cung cấp: `supplier_name`, `supplier_contact`, `supplier_email`, `supplier_address`.
- Người tạo: `created_by` (FK tới `users`).
- Quan hệ:
  - `product_id` -> `products(id)` `ON DELETE SET NULL` (giữ lịch sử nhập kho dù sản phẩm bị xóa).
  - `created_by` -> `users(id)` `ON DELETE SET NULL` (giữ log dù user bị xóa).

### `wallet_transactions`
- Mục đích: giao dịch ví (nạp/mua/refund).
- Cột chính: `id` (PK).
- Trường chính: `user_id` (FK), `amount` DECIMAL(12,2), `method` (vd: transfer), `type` ENUM('topup','purchase','refund'), `note`.
- Phê duyệt: `status` ENUM('pending','approved','rejected'), `approved_by` (FK), `approved_at`.
- Quan hệ:
  - `user_id` -> `users(id)` `ON DELETE CASCADE` (xóa user xóa giao dịch).
  - `approved_by` -> `users(id)` `ON DELETE SET NULL` (giữ lịch sử phê duyệt).

## Ghi chú migration / tương thích
- `orders.payment_gateway`: đổi ENUM → VARCHAR(50) để hỗ trợ `wallet` và mở rộng các cổng khác. Kịch bản migration có sẵn ở cuối file `schema.sql`.
- `orders.total`: nâng DECIMAL(10,2) → DECIMAL(12,2) để chứa giá trị lớn hơn.
- Bảng `product_images` thêm chỉ mục để tối ưu front-end gallery.

## Dữ liệu mẫu
- File `schema.sql` chỉ chèn 4 `categories` mẫu (có `ON DUPLICATE KEY UPDATE` để chạy lặp không lỗi).
- Dữ liệu mẫu đầy đủ (sản phẩm, ảnh, user, đơn hàng) nằm ở `server/database/sample-data.sql`. Chạy riêng khi cần seed demo.

## Quy trình khởi tạo nhanh
1) Tạo database & bảng: `mysql -u root -p < server/database/schema.sql`.
2) (Tuỳ chọn) Seed mẫu đầy đủ: `mysql -u root -p shopweb_db < server/database/sample-data.sql`.
3) Khởi động server và kiểm tra kết nối.

## Mẹo an toàn dữ liệu
- Không dùng `ON DELETE CASCADE` cho bảng giữ lịch sử tài chính nếu cần lưu vết lâu dài; hiện dùng cascade cho `orders` và `order_items` phục vụ dev/demo, có thể chuyển thành `SET NULL` với cột backup dữ liệu nếu đưa vào production.
- Luôn backup trước khi chạy migration ở phần cuối `schema.sql`.


