import { configureStore } from "@reduxjs/toolkit";

// Hiện tại chưa có reducer nào, để trống đã.
// Thành viên A sẽ thêm authSlice, cartSlice sau.
const store = configureStore({
  reducer: {
    // auth: authReducer,  <-- Để comment nhắc nhớ
    // cart: cartReducer,
  },
});

export default store;