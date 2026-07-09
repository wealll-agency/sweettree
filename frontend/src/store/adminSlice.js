import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const PRODUCTS_URL = 'http://localhost:7050/api/products';
const ORDERS_URL = 'http://localhost:7050/api/orders';
const REPORTS_URL = 'http://localhost:7050/api/reports';
const REFUNDS_URL = 'http://localhost:7050/api/refunds';

axios.defaults.withCredentials = true;

const getConfig = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sweettree_token') : null;
  return {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
    withCredentials: true
  };
};

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${REPORTS_URL}/dashboard`, getConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(PRODUCTS_URL, getConfig());
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const addProduct = createAsyncThunk(
  'admin/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(PRODUCTS_URL, productData, getConfig());
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

export const editProduct = createAsyncThunk(
  'admin/editProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${PRODUCTS_URL}/${id}`, data, getConfig());
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const removeProduct = createAsyncThunk(
  'admin/removeProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await axios.delete(`${PRODUCTS_URL}/${productId}`, getConfig());
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(ORDERS_URL, getConfig());
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status, trackingNumber }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${ORDERS_URL}/${id}/status`, { status, trackingNumber }, getConfig());
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const refundOrder = createAsyncThunk(
  'admin/refundOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${ORDERS_URL}/${orderId}/refund`, {}, getConfig());
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process refund');
    }
  }
);

export const fetchRefundRequests = createAsyncThunk(
  'admin/fetchRefundRequests',
  async (status, { rejectWithValue }) => {
    try {
      const url = status ? `${REFUNDS_URL}?status=${status}` : REFUNDS_URL;
      const response = await axios.get(url, getConfig());
      return response.data.refunds;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch refund requests');
    }
  }
);

export const updateRefundRequestStatus = createAsyncThunk(
  'admin/updateRefundRequestStatus',
  async ({ id, status, adminComment }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${REFUNDS_URL}/${id}/status`, { status, adminComment }, getConfig());
      return response.data.refund;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update refund status');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    salesOverview: [],
    topProducts: [],
    lowStockDetails: [],
    products: [],
    orders: [],
    refunds: [],
    loading: false,
    ordersLoading: false,
    productsLoading: false,
    refundsLoading: false,
    error: null
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.salesOverview = action.payload.salesOverview;
        state.topProducts = action.payload.topProducts;
        state.lowStockDetails = action.payload.lowStockDetails;
      })
      // Admin products list
      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsLoading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload;
      })
      // Add product
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      // Edit product
      .addCase(editProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index > -1) {
          state.products[index] = action.payload;
        }
      })
      // Delete product
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      // Admin orders list
      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
      })
      // Refund order
      .addCase(refundOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(o => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
      })
      // Fetch refund requests
      .addCase(fetchRefundRequests.pending, (state) => {
        state.refundsLoading = true;
      })
      .addCase(fetchRefundRequests.fulfilled, (state, action) => {
        state.refundsLoading = false;
        state.refunds = action.payload;
      })
      // Update refund request status
      .addCase(updateRefundRequestStatus.fulfilled, (state, action) => {
        const index = state.refunds.findIndex(r => r._id === action.payload._id);
        if (index > -1) {
          state.refunds[index] = action.payload;
        }
      });
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
