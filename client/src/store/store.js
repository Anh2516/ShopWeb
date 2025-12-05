import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
// import cartReducer from './slices/cartSlice'; // Vẫn giữ comment
// import orderReducer from './slices/orderSlice'; // Vẫn giữ comment

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer, // <--- SỬA DÒNG NÀY: đổi 'product' thành 'products'
    // cart: cartReducer,
    // order: orderReducer,
  },
});