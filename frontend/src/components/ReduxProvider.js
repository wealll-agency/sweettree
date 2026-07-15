'use client';

import { Provider, useDispatch } from 'react-redux';
import { store } from '../store/index.js';
import { useEffect, useRef } from 'react';
import { setCredentials } from '../store/authSlice.js';
import { hydrateCart } from '../store/cartSlice.js';
import { hydrateWishlist } from '../store/wishlistSlice.js';

import axios from 'axios';

function StateHydrator() {
  const dispatch = useDispatch();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Cart Hydration
    const cart = localStorage.getItem('sweettree_cart');
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        // Only keep items that have a valid 24-character hex ID for the product
        const validCart = parsedCart.filter(item => typeof item.product === 'string' && /^[0-9a-fA-F]{24}$/.test(item.product));
        
        if (validCart.length !== parsedCart.length) {
          localStorage.setItem('sweettree_cart', JSON.stringify(validCart));
        }
        dispatch(hydrateCart(validCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    
    // Wishlist Hydration
    const wishlist = localStorage.getItem('sweettree_wishlist');
    if (wishlist) {
      dispatch(hydrateWishlist(JSON.parse(wishlist)));
    }

    // Session Restoration on Startup
    const initAuth = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7050/api';
      
      // Optimistic session restoration from localStorage
      const localUser = localStorage.getItem('sweettree_user');
      if (localUser) {
        try {
          dispatch(setCredentials(JSON.parse(localUser)));
        } catch (e) {
          localStorage.removeItem('sweettree_user');
        }
      } else {
        dispatch(setCredentials(null));
      }

      try {
        const profileRes = await axios.get(`${apiUrl}/auth/profile`, { withCredentials: true });
        dispatch(setCredentials(profileRes.data.user));
      } catch (e) {
        // Session invalid, clear it
        dispatch(setCredentials(null));
      }
    };
    initAuth();

    // Global Axios 401 Interceptor
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7050/api';
          // Don't retry if it's the login or refresh endpoint itself
          if (originalRequest.url && (originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh'))) {
            return Promise.reject(error);
          }
          
          originalRequest._retry = true;
          try {
             await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true });
             // The backend set a new HttpOnly access token cookie, so retry the original request
             return axios(originalRequest);
          } catch(err) {
             // Refresh failed, user is definitely logged out
             dispatch(setCredentials(null));
             return Promise.reject(err);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [dispatch]);

  return null;
}

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <StateHydrator />
      {children}
    </Provider>
  );
}
