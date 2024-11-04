import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { authLogout } from "./authSlice";

export const CartAction = createAsyncThunk(
  "cart/CartAction",
  async ({ id, act }, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const { auth } = getState();

    try {
      const existingItem = await axios.get(
        `/cart?userId=${auth.user.id}&productId=${id}`
      );
      if (act === "add") {
        if (existingItem.data.length > 0) {
          const updatedItem = {
            ...existingItem.data[0],
            quantity: existingItem.data[0].quantity + 1,
          };
          await axios.put(`/cart/${existingItem.data[0].id}`, updatedItem);
          return { productId: id, type: "increase" };
        } else {
          await axios.post("/cart", {
            userId: auth.user.id,
            productId: id,
            quantity: 1,
          });
          return { productId: id, type: "add" };
        }
      } else if (act === "decrease") {
        if (existingItem.data.length > 0) {
          if (existingItem.data[0].quantity > 1) {
            const updatedItem = {
              ...existingItem.data[0],
              quantity: existingItem.data[0].quantity - 1,
            };
            await axios.put(`/cart/${existingItem.data[0].id}`, updatedItem);
            return { productId: id, type: "decrease" };
          } else {
            await axios.delete(`/cart/${existingItem.data[0].id}`);
            return { productId: id, type: "remove" };
          }
        }
      } else if (act === "remove") {
        if (existingItem.data.length > 0) {
          await axios.delete(`/cart/${existingItem.data[0].id}`);
          return { productId: id, type: "remove" };
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data.message || error.message);
      } else {
        return rejectWithValue("An unexpected error");
      }
    }
  }
);

export const actGetCart = createAsyncThunk(
  "cart/actGetCart",
  async (dataType, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const { auth } = getState();

    try {
      const userItemsInCart = await axios.get(`/cart?userId=${auth.user.id}`);

      if (!userItemsInCart.data.length) {
        return { data: [], dataType: "empty" };
      }

      if (dataType === "ProductIds") {
        const concatenatedItemsId = userItemsInCart.data.map(
          (el) => el.productId
        );
        return { data: concatenatedItemsId, dataType: "productsIds" };
      } else {
        const concatenatedItemsId = userItemsInCart.data
          .map((el) => `id=${el.productId}`)
          .join("&");

        const response = await axios.get(`/products?${concatenatedItemsId}`);

        const updatedArray = response.data.map((item) => {
          const quantityObj = userItemsInCart.data.find(
            (q) => q.productId === item.id
          );

          return {
            ...item,
            quantity: quantityObj.quantity,
          };
        });

        return { data: updatedArray, dataType: "ProductsFullInfo" };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data.message || error.message);
      } else {
        return rejectWithValue("An unexpected error");
      }
    }
  }
);

export const deleteCart = createAsyncThunk("cart/deleteCart", async (_, thunkAPI) => {
  const { rejectWithValue, getState } = thunkAPI;
  const { auth } = getState();

  try {
    const cartItems = await axios.get(`/cart?userId=${auth.user.id}`);
    await Promise.all(
      cartItems.data.map((item) => axios.delete(`/cart/${item.id}`))
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data.message || error.message);
    } else {
      return rejectWithValue("An unexpected error");
    }
  }
});

const initialState = {
  cartIds: [],
  cartProducts: [],
  isLoading: false,
  error: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cleanCart: (state) => {
      state.cartProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(CartAction.pending, (state) => {
      state.error = null;
    });
    builder.addCase(CartAction.fulfilled, (state, action) => {
      // increase product quantity
      if (action.payload.type === "increase") {
        const productInFull = state.cartProducts.find(
          (item) => item.id === action.payload.productId
        );
        if (productInFull) {
          productInFull.quantity++;
        }
        // add product to cart
      } else if (action.payload.type === "add") {
        state.cartIds.push(action.payload.productId);
        // decrease product quantity
      } else if (action.payload.type === "decrease") {
        const productInFull = state.cartProducts.find(
          (item) => item.id === action.payload.productId
        );
        if (productInFull) {
          productInFull.quantity--;
        }
        // remove product from cart
      } else if (action.payload.type === "remove") {
        state.cartIds = state.cartIds.filter(
          (item) => item !== action.payload.productId
        );
        state.cartProducts = state.cartProducts.filter(
          (item) => item.id !== action.payload.productId
        );
      }
    });
    builder.addCase(CartAction.rejected, (state, action) => {
      state.error = action.payload;
    });

    // get cart
    builder.addCase(actGetCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(actGetCart.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.dataType === "ProductsFullInfo") {
        state.cartProducts = action.payload.data;
      } else if (action.payload.dataType === "productsIds") {
        state.cartIds = action.payload.data;
      }
    });
    builder.addCase(actGetCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // delete cart
    builder.addCase(deleteCart.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteCart.fulfilled, (state) => {
      state.isLoading = false;
      state.cartProducts = [];
      state.cartIds = [];
    });
    builder.addCase(deleteCart.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(authLogout, (state) => {
      state.cartIds = [];
      state.cartProducts = [];
    });
  },
});

export const { cleanCart } = cartSlice.actions;
export default cartSlice.reducer;
