"use client";

import {
  CartItem,
  decrementAmount,
  handleCountValue,
  incrementAmount,
} from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type CounterProps = {
  product: CartItem;
  quantity: number;
  className?: string;
};

const Counter = ({ className, quantity, product }: CounterProps) => {
  const { cartItems, countValue } = useAppSelector((state) => state.cartSlice);
  const dispatch = useDispatch();

  const addedItem = cartItems.find((item) => item._id === product._id);

  const handleCount = (num: number) => {
    if (addedItem) {
      if (num === 1) {
        dispatch(incrementAmount(product._id));
      } else {
        dispatch(decrementAmount(product._id));
      }
    }
    dispatch(handleCountValue(num === 1 ? "increment" : "decrement"));
  };

  return (
    <div className={cn("flex items-center max-w-[200px]", className)}>
      <Button
        type="button"
        variant="outline"
        className="text-xl select-none"
        disabled={addedItem?.amount ? addedItem?.amount <= 1 : countValue <= 1}
        onClick={() => handleCount(-1)}
      >
        -
      </Button>
      <Input
        className="text-center"
        readOnly
        value={addedItem?.amount || countValue}
        type="number"
      />
      <Button
        type="button"
        variant="outline"
        className="text-xl select-none"
        disabled={
          quantity && addedItem?.amount
            ? addedItem?.amount >= quantity
            : countValue >= quantity
        }
        onClick={() => handleCount(1)}
      >
        +
      </Button>
    </div>
  );
};

export default Counter;
