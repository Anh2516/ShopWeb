import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/products';

// Lấy tất cả sản phẩm
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { admin, ...rest } = params;
      let url = API_URL;
      const config = { params: rest };

      if (admin) {
        const token = getState().auth.token;
        url = `${API_URL}/admin`;
        config.headers = { Authorization: `Bearer ${token}` };
      }

      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải sản phẩm');
    }
  }
);

// Lấy sản phẩm theo ID
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      
      // Kiểm tra response có đúng format không
      if (!response.data || !response.data.product) {
        console.error('Response không đúng format:', response.data);
        return rejectWithValue('Dữ liệu sản phẩm không hợp lệ');
      }
      
      return response.data.product;
    } catch (error) {
      console.error('Lỗi fetchProductById:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Lỗi tải sản phẩm';
      return rejectWithValue(errorMessage);
    }
  }
);

// Tạo sản phẩm (Admin)
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(API_URL, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tạo sản phẩm');
    }
  }
);

// Cập nhật sản phẩm (Admin)
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_URL}/${id}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật sản phẩm');
    }
  }
);

// Xóa sản phẩm (Admin)
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi xóa sản phẩm');
    }
  }
);

// Ẩn/hiện sản phẩm
export const toggleProductVisibility = createAsyncThunk(
  'products/toggleVisibility',
  async ({ id, isVisible }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(
        `${API_URL}/${id}/visibility`,
        { is_visible: isVisible },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật trạng thái sản phẩm');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    pagination: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || [];
        state.pagination = action.payload.pagination || {};
        // Debug log
        console.log('Products loaded:', state.items.length, 'items');
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Error fetching products:', action.payload);
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentProduct = null; // Clear product khi fetch mới
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không tìm thấy sản phẩm';
        state.currentProduct = null; // Clear product khi lỗi
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(toggleProductVisibility.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;

