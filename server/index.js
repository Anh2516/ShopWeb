const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
// CORS configuration - cho phép tất cả origins hoặc chỉ định cụ thể
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://tuananh.surf', 'http://tuananh.surf'];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Tạm thời cho phép tất cả để debug
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware để debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.query);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/upload', require('./routes/upload'));

const PORT = process.env.PORT || 5000;

// Start server với test connection
async function startServer() {
  const connected = await testConnection();
  
  if (!connected) {
    console.error('\n⚠️  Server vẫn sẽ khởi động nhưng có thể gặp lỗi khi sử dụng database.');
    console.error('   Vui lòng kiểm tra kết nối database trước khi sử dụng.\n');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  });
}

startServer();

