import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/slices/cartSlice';
import productReducer from '../features/product/slices/productSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
  },
  // DevTools middleware is enabled by default in non-production
});

export default store;
