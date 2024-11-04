import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { authLogout } from "./authSlice";

const initialState = {
  favouriteIds: [],
  favouriteProducts: [],
  error: null,
  loading: false,
};

export const actLikeToggle = createAsyncThunk(
  "favourites/actLikeToggle",
  async (id, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const { auth } = getState();

    try {
      const isRecordExist = await axios.get(
        `/favourites?userId=${auth.user.id}&productId=${id}`
      );

      if (isRecordExist.data.length > 0) {
        await axios.delete(`/favourites/${isRecordExist.data[0].id}`);
        return { type: "remove", id };
      } else {
        await axios.post("/favourites", {
          userId: auth.user.id,
          productId: id,
        });
        return { type: "add", id };
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

export const actGetFavourites = createAsyncThunk(
  "favourites/actGetFavourites",
  async (dataType, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const { auth } = getState();

    try {
      const userfavourites = await axios.get(
        `/favourites?userId=${auth.user.id}`
      );

      if (!userfavourites.data.length) {
        return { data: [], dataType: "empty" };
      }

      if (dataType === "ProductIds") {
        const concatenatedItemsId = userfavourites.data.map(
          (el) => el.productId
        );
        return { data: concatenatedItemsId, dataType: "productsIds" };
      } else {
        const concatenatedItemsId = userfavourites.data
          .map((el) => `id=${el.productId}`)
          .join("&");

        const response = await axios.get(`/products?${concatenatedItemsId}`);
        return { data: response.data, dataType: "ProductsFullInfo" };
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

export const favouritesSlice = createSlice({
  name: "favouritesSlice",
  initialState,
  reducers: {
    favouritesCleanUp: (state) => {
      state.favouriteProducts = [];
    },
  },

  // add or remove from favourites
  extraReducers: (builder) => {
    builder.addCase(actLikeToggle.pending, (state) => {
      state.error = null;
    });
    builder.addCase(actLikeToggle.fulfilled, (state, action) => {
      if (action.payload.type === "add") {
        state.favouriteIds.push(action.payload.id);
      } else {
        state.favouriteIds = state.favouriteIds.filter((el) => el !== action.payload.id);
        state.favouriteProducts = state.favouriteProducts.filter(
          (el) => el.id !== action.payload.id
        );
      }
    });
    builder.addCase(actLikeToggle.rejected, (state, action) => {
      state.error = action.payload;
    });

    // get favourites items
    builder.addCase(actGetFavourites.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(actGetFavourites.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.dataType === "ProductsFullInfo") {
        state.favouriteProducts = action.payload.data;
      } else if (action.payload.dataType === "productsIds") {
        state.favouriteIds = action.payload.data;
      }
    });
    builder.addCase(actGetFavourites.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(authLogout, (state) => {
      state.favouriteIds = [];
      state.favouriteProducts = [];
    });
  },
});

export const { favouritesCleanUp } = favouritesSlice.actions;
export default favouritesSlice.reducer;
