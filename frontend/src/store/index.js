import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import cartReducer from './cartSlice.js';
import productsReducer from './productsSlice.js';
import ordersReducer from './ordersSlice.js';
import wishlistReducer from './wishlistSlice.js';
import adminReducer from './adminSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    orders: ordersReducer,
    wishlist: wishlistReducer,
    admin: adminReducer
  }
});
