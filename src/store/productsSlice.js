import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getProducts = createAsyncThunk(
  "products/getProducts",
  async (prefix, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await axios.get(
        `/products?catPrefix=${prefix}`
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = { products: [], isLoading: false, error: null };

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    cleanProducts: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { cleanProducts } = productsSlice.actions;
export default productsSlice.reducer;
