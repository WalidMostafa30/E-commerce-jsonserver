import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const userLS = localStorage.getItem("userLS")
  ? JSON.parse(localStorage.getItem("userLS"))
  : null;

const userInLocalStorage = (data) => {
  localStorage.setItem("userLS", JSON.stringify(data));
};

const accessTokenLS = localStorage.getItem("accessTokenLS")
  ? JSON.parse(localStorage.getItem("accessTokenLS"))
  : null;

const accessTokenInLocalStorage = (data) => {
  localStorage.setItem("accessTokenLS", JSON.stringify(data));
};

const initialState = {
  user: userLS,
  accessToken: accessTokenLS,
  loading: false,
  error: null,
};

export const actAuthRegister = createAsyncThunk(
  "auth/actAuthRegister",
  async (formData, thunk) => {
    const { rejectWithValue } = thunk;

    try {
      const res = await axios.post("/register", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const actAuthLogin = createAsyncThunk(
  "auth/actAuthLogin",
  async (formData, thunk) => {
    const { rejectWithValue } = thunk;

    try {
      const res = await axios.post("/login", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authLogout: (state) => {
      state.user = null;
      state.accessToken = null;
      userInLocalStorage(state.user);
      accessTokenInLocalStorage(state.accessToken);
    },
  },
  extraReducers: (builder) => {
    //register
    builder.addCase(actAuthRegister.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(actAuthRegister.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(actAuthRegister.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // login
    builder.addCase(actAuthLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(actAuthLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      userInLocalStorage(state.user);
      accessTokenInLocalStorage(state.accessToken);
    });
    builder.addCase(actAuthLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { authLogout } = authSlice.actions;
export default authSlice.reducer;
