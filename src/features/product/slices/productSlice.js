import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import productsData from '../../../assets/products.json';

// Mocking API fetch with local data
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return productsData;
    } catch (error) {
      return rejectWithValue('Failed to load local data');
    }
  }
);

const initialState = {
  items: [],
  filteredItems: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  category: 'all',
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
      if (action.payload === 'all') {
        state.filteredItems = state.items;
      } else {
        state.filteredItems = state.items.filter(item => item.category === action.payload);
      }
    },
    searchProducts: (state, action) => {
      const query = action.payload.toLowerCase();
      state.filteredItems = state.items.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.filteredItems = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { setCategory, searchProducts } = productSlice.actions;

export default productSlice.reducer;
