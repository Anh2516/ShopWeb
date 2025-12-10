# Hướng dẫn cấu hình các Provider Upload Ảnh

Hệ thống hỗ trợ 4 dịch vụ upload ảnh phổ biến. Bạn chỉ cần chọn 1 provider và cấu hình trong file `.env`.

## So sánh các Provider

| Provider | Free Tier | Giới hạn File | Độ khó setup | Khuyến nghị |
|---------|-----------|---------------|--------------|------------|
| **ImgBB** | Không giới hạn | 32MB | ⭐ Dễ | ✅ Tốt cho bắt đầu |
| **Imgur** | Không giới hạn | 10MB | ⭐ Dễ | ✅ Tốt cho bắt đầu |
| **Cloudinary** | 25GB storage, 25GB bandwidth/tháng | Không giới hạn | ⭐⭐ Trung bình | ✅✅ Tốt nhất cho production |
| **ImageKit** | 20GB storage, 20GB bandwidth/tháng | Không giới hạn | ⭐⭐ Trung bình | ✅ Tốt cho production |

## 1. ImgBB (Khuyến nghị cho người mới)

### Ưu điểm:
- Setup đơn giản nhất
- Không giới hạn số lượng upload
- API miễn phí hoàn toàn

### Nhược điểm:
- Giới hạn 32MB/file
- Không có CDN

### Cách setup:
1. Truy cập [https://api.imgbb.com/](https://api.imgbb.com/)
2. Đăng ký/đăng nhập
3. Vào phần "API" → Copy API key
4. Thêm vào `.env`:
```env
IMAGE_UPLOAD_PROVIDER=imgbb
IMGBB_API_KEY=your_api_key_here
```

---

## 2. Imgur

### Ưu điểm:
- Setup đơn giản
- Không giới hạn số lượng
- Phổ biến, ổn định

### Nhược điểm:
- Giới hạn 10MB/file
- Cần Client ID

### Cách setup:
1. Truy cập [https://api.imgur.com/oauth2/addclient](https://api.imgur.com/oauth2/addclient)
2. Đăng nhập Imgur
3. Tạo ứng dụng mới:
   - Application name: Tên bất kỳ
   - Authorization type: **Anonymous usage without user authorization**
   - Authorization callback URL: `http://localhost:3000` (hoặc để trống)
4. Copy **Client ID**
5. Thêm vào `.env`:
```env
IMAGE_UPLOAD_PROVIDER=imgur
IMGUR_CLIENT_ID=your_client_id_here
```

---

## 3. Cloudinary (Khuyến nghị cho Production)

### Ưu điểm:
- Free tier rất tốt (25GB storage, 25GB bandwidth/tháng)
- CDN toàn cầu, tốc độ nhanh
- Tự động resize, optimize ảnh
- Hỗ trợ nhiều tính năng nâng cao

### Nhược điểm:
- Setup phức tạp hơn một chút
- Cần tạo Upload Preset

### Cách setup:
1. Truy cập [https://cloudinary.com/](https://cloudinary.com/)
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard → Copy các thông tin:
   - **Cloud Name** (ví dụ: `dxyz123`)
   - **API Key** (ví dụ: `123456789012345`)
   - **API Secret** (ví dụ: `abcdefghijklmnopqrstuvwxyz`)
4. Tạo Upload Preset:
   - Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Signing mode: **Unsigned** (để upload không cần chữ ký)
   - Folder: `shopweb` (tùy chọn)
   - Click "Save"
   - Copy tên preset (ví dụ: `ml_default`)
5. Thêm vào `.env`:
```env
IMAGE_UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=ml_default
```

---

## 4. ImageKit

### Ưu điểm:
- Free tier tốt (20GB storage, 20GB bandwidth/tháng)
- CDN toàn cầu
- Tự động optimize ảnh

### Nhược điểm:
- Setup phức tạp hơn
- Cần 3 thông tin (Public Key, Private Key, URL Endpoint)

### Cách setup:
1. Truy cập [https://imagekit.io/](https://imagekit.io/)
2. Đăng ký tài khoản miễn phí
3. Vào Dashboard → Developer Options
4. Copy các thông tin:
   - **Public Key** (ví dụ: `public_xxxxx`)
   - **Private Key** (ví dụ: `private_xxxxx`)
   - **URL Endpoint** (ví dụ: `https://ik.imagekit.io/your_imagekit_id`)
5. Thêm vào `.env`:
```env
IMAGE_UPLOAD_PROVIDER=imagekit
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

---

## Chuyển đổi Provider

Bạn có thể chuyển đổi provider bằng 2 cách:

### Cách 1: Thay đổi trong `.env`
```env
IMAGE_UPLOAD_PROVIDER=cloudinary  # Đổi từ imgbb sang cloudinary
```

### Cách 2: Thay đổi trong request (tạm thời)
```javascript
// Upload với provider cụ thể
const formData = new FormData();
formData.append('image', file);

await axios.post('/api/upload/image?provider=imgur', formData, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

## Khuyến nghị

- **Bắt đầu/Development**: Dùng **ImgBB** hoặc **Imgur** (setup đơn giản)
- **Production**: Dùng **Cloudinary** hoặc **ImageKit** (CDN, tốc độ nhanh, free tier tốt)

