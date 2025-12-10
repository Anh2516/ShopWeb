# Hướng dẫn setup ImgBB

## Bước 1: Lấy API Key

1. Truy cập [https://api.imgbb.com/](https://api.imgbb.com/)
2. Click **"Get API Key"** hoặc **"Sign Up"** nếu chưa có tài khoản
3. Đăng ký/Đăng nhập bằng:
   - Email
   - Hoặc đăng nhập bằng Google/GitHub
4. Sau khi đăng nhập, bạn sẽ thấy **API Key** của mình
5. Copy API Key (ví dụ: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

## Bước 2: Cấu hình trong .env

Thêm vào file `server/.env`:

```env
# Chọn ImgBB làm provider upload ảnh
IMAGE_UPLOAD_PROVIDER=imgbb

# API Key từ ImgBB
IMGBB_API_KEY=your_api_key_here
```

**Ví dụ:**
```env
IMAGE_UPLOAD_PROVIDER=imgbb
IMGBB_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Bước 3: Restart Server

Sau khi thêm API key, restart server:

```bash
# Dừng server (Ctrl+C)
# Sau đó chạy lại:
cd server
npm run dev
```

## Bước 4: Test Upload

1. Vào Admin → Quản lý sản phẩm
2. Tạo/Sửa sản phẩm
3. Click **"📤 Upload từ máy"**
4. Chọn file ảnh (tối đa 32MB)
5. Đợi upload xong → URL sẽ tự động điền vào form

## Giới hạn ImgBB

- ✅ **File size**: Tối đa 32MB/file
- ✅ **Số lượng**: Không giới hạn
- ✅ **Bandwidth**: Không giới hạn
- ✅ **Storage**: Không giới hạn
- ✅ **Hoàn toàn miễn phí**

## Xử lý lỗi

### Lỗi: "Chưa cấu hình IMGBB_API_KEY"
→ Kiểm tra file `.env` có đúng tên biến không

### Lỗi: "Invalid API key"
→ API key không đúng, kiểm tra lại trên [https://api.imgbb.com/](https://api.imgbb.com/)

### Lỗi: "File too large"
→ File vượt quá 32MB, hãy resize ảnh nhỏ hơn

## Lưu ý

- API key là **miễn phí** và **không giới hạn**
- Ảnh được lưu vĩnh viễn trên ImgBB
- URL ảnh có dạng: `https://i.ibb.co/xxxxx/image.jpg`
- Có thể xóa ảnh bằng `delete_url` (nếu cần)

