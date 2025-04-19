import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the slice state
export type CartItem = {
  _id: number | string;
  title: string;
  price: number;
  amount?: number;
  image: string[];
  unit_of_measure: string;
  shop_category: string;
  selectedSize?: string | undefined;
  selectedColor?: string | undefined;
};

export interface CartState {
  cartItems: CartItem[];
  wishlists: AllProduct[];
  isCartOpen: boolean;
  countValue: number;
  selectedSize: string | undefined;
  selectedColor: string | undefined;
}

// Define the initial state using that type
const initialState: CartState = {
  cartItems:
    (typeof window !== "undefined" &&
      JSON.parse(window.localStorage.getItem("cartItems") as string)) ||
    [],
  isCartOpen: false,
  wishlists:
    (typeof window !== "undefined" &&
      JSON.parse(window.localStorage.getItem("wishlists") as string)) ||
    [],
  countValue: 1,
  selectedSize: undefined,
  selectedColor: undefined,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    handleCartOpen: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    // add to cart
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = state.cartItems.find(
        (item) => item._id === action.payload._id
      );

      if (item) {
        item.selectedColor = state.selectedColor;
        item.selectedSize = state.selectedSize;
        return;
      }
      state.cartItems = [...state.cartItems, action.payload];
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      state.selectedColor = undefined;
      state.selectedSize = undefined;
    },

    // delete
    removeFromCart: (state, action: PayloadAction<number | string>) => {
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== action.payload
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      state.countValue = 1;
      state.selectedColor = undefined;
      state.selectedSize = undefined;
    },

    incrementAmount: (state, action: PayloadAction<number | string>) => {
      const item = state.cartItems.find((item) => item._id === action.payload);
      if (item) {
        item.amount = item.amount ? item.amount + 1 : 1;
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        return;
      }
    },

    // decrementamount
    decrementAmount: (state, action: PayloadAction<number | string>) => {
      const item = state.cartItems.find((item) => item._id === action.payload);

      if (item) {
        if (item.amount === 1) {
          state.cartItems = state.cartItems.filter(
            (item) => item._id !== action.payload
          );
          localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
          return;
        }
        item.amount = item.amount ? item.amount - 1 : 1;
        return;
      }
    },

    // add to wishlist
    toggleToWishlists: (state, action: PayloadAction<AllProduct>) => {
      const existingItem = state.wishlists.find(
        (item) => item._id === action.payload._id
      );
      if (existingItem) {
        state.wishlists = state.wishlists.filter(
          (wishlist) => wishlist._id !== action.payload._id
        );
        localStorage.setItem("wishlists", JSON.stringify(state.wishlists));
      } else {
        state.wishlists = [...state.wishlists, action.payload];
        localStorage.setItem("wishlists", JSON.stringify(state.wishlists));
      }
    },

    // counter
    handleCountValue: (
      state,
      action: PayloadAction<"increment" | "decrement" | "none">
    ) => {
      if (action.payload === "none") {
        state.countValue = 1;
      } else {
        state.countValue =
          action.payload === "increment"
            ? state.countValue + 1
            : state.countValue - 1;
      }
    },

    // selected color
    handleColorChange: (state, action: PayloadAction<string | undefined>) => {
      state.selectedColor = action.payload;
    },

    // selected Sizes
    handleSizeChange: (state, action: PayloadAction<string | undefined>) => {
      state.selectedSize = action.payload;
    },
  },
});

export const {
  addToCart,
  handleCountValue,
  incrementAmount,
  removeFromCart,
  decrementAmount,
  handleCartOpen,
  toggleToWishlists,
  handleColorChange,
  handleSizeChange,
} = cartSlice.actions;
export default cartSlice.reducer;
