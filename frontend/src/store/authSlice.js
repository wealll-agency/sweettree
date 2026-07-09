import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/auth` : 'http://localhost:7050/api/auth';

// Configure Axios to send cookies
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

// Load user from localStorage if available
const getInitialUser = () => {
  return null;
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, phone }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/register`, { name, email, password, phone });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sweettree_user', JSON.stringify(response.data.user));
        if (response.data.token) {
          localStorage.setItem('sweettree_token', response.data.token);
        }
      }
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      if (typeof window !== 'undefined') {
        localStorage.setItem('sweettree_user', JSON.stringify(response.data.user));
        if (response.data.token) {
          localStorage.setItem('sweettree_token', response.data.token);
        }
      }
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API_URL}/logout`);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sweettree_user');
        localStorage.removeItem('sweettree_token');
      }
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/profile`, profileData, getConfig());
      if (typeof window !== 'undefined') {
        localStorage.setItem('sweettree_user', JSON.stringify(response.data.user));
      }
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const addAddress = createAsyncThunk(
  'auth/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/addresses`, addressData, getConfig());
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'auth/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/addresses/${addressId}`, getConfig());
      return response.data.addresses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getInitialUser(),
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Address
      .addCase(addAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
          localStorage.setItem('sweettree_user', JSON.stringify(state.user));
        }
      })
      // Delete Address
      .addCase(deleteAddress.fulfilled, (state, action) => {
        if (state.user) {
          state.user.addresses = action.payload;
          localStorage.setItem('sweettree_user', JSON.stringify(state.user));
        }
      });
  }
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
