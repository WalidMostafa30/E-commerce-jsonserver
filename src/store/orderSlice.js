import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const addOrder = createAsyncThunk(
  "order/addOrder",
  async ({ name, email }, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const { auth } = getState();

    try {
      const userCart = await axios.get(`/cart?userId=${auth.user.id}`);

      const concatenatedItemsId = userCart.data
        .map((el) => `id=${el.productId}`)
        .join("&");

      const products = await axios.get(`/products?${concatenatedItemsId}`);

      const fullProducts = products.data.map((item) => {
        const quantityObj = userCart.data.find((q) => q.productId === item.id);

        return {
          id: item.id,
          title: item.title,
          image: item.images[0],
          price: item.price,
          quantity: quantityObj.quantity,
        };
      });
      const totalProduct = fullProducts.length;

      const totalPrice = fullProducts.reduce((acc, product) => {
        acc += product.price * product.quantity;
        return acc;
      }, 0);

      const totalPieces = fullProducts.reduce((acc, product) => {
        acc += product.quantity;
        return acc;
      }, 0);

      const time = new Date();

      const orderData = {
        userId: auth.user.id,
        name,
        email,
        date: `${time.getFullYear()}/${time.getMonth() + 1}/${time.getDate()}`,
        time: `${time.getHours()}:${time.getMinutes()}`,
        totalProduct,
        totalPieces,
        totalPrice,
        products: fullProducts,
      };

      const res = await axios.post(`/order`, orderData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (id, thunkAPI) => {
    const { rejectWithValue } = thunkAPI;
    try {
      await axios.delete(`/order/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getOrders = createAsyncThunk(
  "order/getOrders",
  async (_, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const { auth } = getState();
    try {
      const res = await axios.get(`/order?userId=${auth.user.id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = { orders: [], isLoading: false, error: null };

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    cleanOrders: (state) => {
      state.orders = [];
    },
  },
  extraReducers: (builder) => {
    // get orders
    builder
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // delete order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.filter(
          (order) => order.id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { cleanOrders } = orderSlice.actions;
export default orderSlice.reducer;
