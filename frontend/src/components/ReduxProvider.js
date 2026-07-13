'use client';

import { Provider, useDispatch } from 'react-redux';
import { store } from '../store/index.js';
import { useEffect } from 'react';
import { setCredentials } from '../store/authSlice.js';
import { hydrateCart } from '../store/cartSlice.js';
import { hydrateWishlist } from '../store/wishlistSlice.js';

import axios from 'axios';

function StateHydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Auth Hydration
    const user = localStorage.getItem('sweettree_user');
    if (user) {
      dispatch(setCredentials(JSON.parse(user)));
    }
    
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

    // Global Axios Request Interceptor for Bearer Token
    const reqInterceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('sweettree_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Global Axios 401 Interceptor
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Clear local storage and redux state if unauthorized and from our API
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7050/api';
          if (error.config.url && error.config.url.includes(apiUrl) && !error.config.url.includes('/login')) {
            localStorage.removeItem('sweettree_user');
            localStorage.removeItem('sweettree_token');
            dispatch(setCredentials(null));
            window.location.href = '/login?session=expired';
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
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
