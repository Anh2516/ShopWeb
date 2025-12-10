const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const { verifyToken, requireAdmin } = require('../config/auth');
require('dotenv').config();

// Cấu hình multer để lưu file tạm thời trong memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 32 * 1024 * 1024 // 32MB (giới hạn của ImgBB)
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận file ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  }
});

// ============================================
// CÁC PROVIDER UPLOAD ẢNH
// ============================================

// 1. ImgBB
async function uploadToImgBB(fileBuffer, filename, mimetype) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('Chưa cấu hình IMGBB_API_KEY trong .env');
  }

  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', fileBuffer, {
    filename: filename,
    contentType: mimetype
  });

  const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  if (response.data?.success && response.data?.data) {
    const data = response.data.data;
    return {
      url: data.url || data.display_url,
      thumbnailUrl: data.thumb?.url,
      deleteUrl: data.delete_url,
      provider: 'imgbb'
    };
  }
  throw new Error('Lỗi từ ImgBB API');
}

// 2. Imgur (miễn phí, không cần API key cho public upload)
async function uploadToImgur(fileBuffer, filename, mimetype) {
  const clientId = process.env.IMGUR_CLIENT_ID;
  if (!clientId) {
    throw new Error('Chưa cấu hình IMGUR_CLIENT_ID trong .env. Lấy tại: https://api.imgur.com/oauth2/addclient');
  }

  const base64 = fileBuffer.toString('base64');
  const formData = new FormData();
  formData.append('image', base64);

  const response = await axios.post('https://api.imgur.com/3/image', formData, {
    headers: {
      ...formData.getHeaders(),
      Authorization: `Client-ID ${clientId}`
    }
  });

  if (response.data?.success && response.data?.data) {
    const data = response.data.data;
    return {
      url: data.link,
      thumbnailUrl: data.link.replace(/\.(jpg|jpeg|png|gif)$/i, 't.$1'),
      deleteUrl: `https://imgur.com/delete/${data.deletehash}`,
      provider: 'imgur'
    };
  }
  throw new Error('Lỗi từ Imgur API');
}

// 3. Cloudinary (rất phổ biến, free tier tốt)
async function uploadToCloudinary(fileBuffer, filename, mimetype) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Chưa cấu hình CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET trong .env');
  }

  const base64 = fileBuffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${base64}`;

  const formData = new FormData();
  formData.append('file', dataUri);
  formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default');

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
    {
      headers: formData.getHeaders(),
      auth: {
        username: apiKey,
        password: apiSecret
      }
    }
  );

  if (response.data?.secure_url) {
    return {
      url: response.data.secure_url,
      thumbnailUrl: response.data.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/'),
      deleteUrl: null, // Cloudinary cần API để delete
      provider: 'cloudinary',
      publicId: response.data.public_id
    };
  }
  throw new Error('Lỗi từ Cloudinary API');
}

// 4. ImageKit (free tier tốt)
async function uploadToImageKit(fileBuffer, filename, mimetype) {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error('Chưa cấu hình IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT trong .env');
  }

  const base64 = fileBuffer.toString('base64');
  const crypto = require('crypto');
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(timestamp + base64)
    .digest('hex');

  const formData = new FormData();
  formData.append('file', base64);
  formData.append('fileName', filename);
  formData.append('publicKey', publicKey);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp.toString());

  const response = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData, {
    headers: formData.getHeaders()
  });

  if (response.data?.url) {
    return {
      url: response.data.url,
      thumbnailUrl: response.data.thumbnailUrl,
      deleteUrl: null,
      provider: 'imagekit',
      fileId: response.data.fileId
    };
  }
  throw new Error('Lỗi từ ImageKit API');
}

// ============================================
// ROUTE HANDLER
// ============================================

router.post('/image', verifyToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng chọn file ảnh' 
      });
    }

    // Lấy provider từ query hoặc env (mặc định: imgbb - ImgBB)
    const provider = (req.query.provider || process.env.IMAGE_UPLOAD_PROVIDER || 'imgbb').toLowerCase();
    
    let result;
    try {
      switch (provider.toLowerCase()) {
        case 'imgbb':
          result = await uploadToImgBB(req.file.buffer, req.file.originalname, req.file.mimetype);
          break;
        case 'imgur':
          result = await uploadToImgur(req.file.buffer, req.file.originalname, req.file.mimetype);
          break;
        case 'cloudinary':
          result = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
          break;
        case 'imagekit':
          result = await uploadToImageKit(req.file.buffer, req.file.originalname, req.file.mimetype);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: `Provider "${provider}" không được hỗ trợ. Các provider hợp lệ: imgbb, imgur, cloudinary, imagekit`
          });
      }

      res.json({
        success: true,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        deleteUrl: result.deleteUrl,
        provider: result.provider,
        message: `Upload ảnh thành công (${result.provider})`
      });
    } catch (providerError) {
      return res.status(500).json({
        success: false,
        message: providerError.message || `Lỗi khi upload lên ${provider}`,
        provider: provider
      });
    }
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi upload ảnh'
    });
  }
});

module.exports = router;
