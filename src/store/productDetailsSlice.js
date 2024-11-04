import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const getProductDetails = createAsyncThunk(
  "productDetails/getProductDetails",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;

    try {
      const res = await axios.get(`/products?id=${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = { productDetails: {}, isLoading: false, error: null };

const productDetailsSlice = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    cleanProductDetails: (state) => {
      state.productDetails = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProductDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload[0];
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { cleanProductDetails } = productDetailsSlice.actions;
export default productDetailsSlice.reducer;
