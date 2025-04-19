import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./features/cart/cartSlice";
import authSlice from "./features/auth/authSlice";
import sidebarSlice from "./features/sidebar/sidebarSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      authSlice,
      cartSlice,
      sidebarSlice,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
