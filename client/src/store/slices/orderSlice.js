import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/orders';

// Tạo đơn hàng
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(API_URL, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { 
        order: response.data.order,
        newBalance: response.data.newBalance 
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tạo đơn hàng');
    }
  }
);

// Lấy đơn hàng của user
export const fetchMyOrders = createAsyncThunk(
  'orders/fetchMyOrders',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải đơn hàng');
    }
  }
);

// Lấy tất cả đơn hàng (Admin)
export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAllOrders',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_URL}/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải đơn hàng');
    }
  }
);

// Cập nhật trạng thái đơn hàng (Admin)
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.put(`${API_URL}/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { id, status };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật đơn hàng');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        // newBalance sẽ được xử lý trong authSlice
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const order = state.items.find(o => o.id === action.payload.id);
        if (order) {
          order.status = action.payload.status;
        }
      });
  },
});

export default orderSlice.reducer;

