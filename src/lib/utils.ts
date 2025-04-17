import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CartItem } from "./features/cart/cartSlice";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const rgx = (value: string) => `(?<=^|,)${value}(?=,|$)`;

export const totalPrice = (cartItems: CartItem[]) => {
  return parseFloat(
    cartItems
      .reduce((total, item) => {
        return total + Number(item.price) * (item?.amount || 1);
      }, 0)
      .toFixed(2)
  );
};

export const discountPercent = (
  price: number | string,
  oldPrice: number | string
) => {
  const _oldPrice = Number(oldPrice);
  const _price = Number(price);
  const discount = (_oldPrice - _price) / _oldPrice;

  return Math.round(discount * 100) + "%";
};
