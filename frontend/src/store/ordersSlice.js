import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/orders` : 'https://sweettreeon.com/api/orders';
const DELHIVERY_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/delhivery` : 'https://sweettreeon.com/api/delhivery';
const REFUND_API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/refunds` : 'https://sweettreeon.com/api/refunds';

// Configure axios to support cookies
axios.defaults.withCredentials = true;

const getConfig = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sweettree_token') : null;
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    withCredentials: true
  };
};

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, orderData, getConfig());
      return response.data; // contains local order and razorpayOrder
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Order creation failed');
    }
  }
);



export const fetchMyOrders = createAsyncThunk(
  'orders/fetchAllMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/my-orders`, getConfig());
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load order history');
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`, getConfig());
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

export const trackDelhiveryShipment = createAsyncThunk(
  'orders/trackDelhiveryShipment',
  async (waybill, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${DELHIVERY_URL}/track/${waybill}`, getConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to track shipment');
    }
  }
);

export const createRefundRequest = createAsyncThunk(
  'orders/createRefundRequest',
  async ({ orderId, reason, customerComment }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${REFUND_API_URL}/request/${orderId}`, { reason, customerComment }, getConfig());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit refund request');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    activeOrder: null,
    ccavenuePayload: null,
    loading: false,
    orderLoading: false,
    error: null
  },
  reducers: {
    clearActiveOrder: (state) => {
      state.activeOrder = null;
      state.ccavenuePayload = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.activeOrder = action.payload.order;
        state.ccavenuePayload = {
          encRequest: action.payload.encRequest,
          accessCode: action.payload.accessCode
        };
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.orderLoading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload;
      })
      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.orderLoading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.activeOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearActiveOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
