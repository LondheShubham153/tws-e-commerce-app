"use client";

import {
  CartItem,
  addToCart,
  decrementAmount,
  handleCountValue,
  incrementAmount,
  removeFromCart,
} from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { PiBasketFill } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { Button } from "./ui/button";

type AddToCartWrapperProps = {
  product: AllProduct;
  btnStyle?: "style-1" | "style-2" | "style-3" | "style-4" | "withoutCounter";
};

const AddToCartBtnWrapper = ({
  product,
  btnStyle = "style-1",
}: AddToCartWrapperProps) => {
  const router = useRouter();
  const [addedItem, setAddedItem] = useState<undefined | CartItem>();
  const [disableBtn, setDisableBtn] = useState(true);
  const { cartItems, countValue, selectedColor, selectedSize } = useAppSelector(
    (state) => state.cartSlice
  );
  const dispatch = useDispatch();

  useEffect(() => {
    setAddedItem(cartItems.find((item) => item._id === product._id));
    dispatch(handleCountValue("none"));
    return () => {};
  }, [product._id, cartItems, dispatch]);

  // handle add to cart button
  const handleAddToCart = (withCounter: boolean) => {
    if (product.shop_category === "clothing") {
      // checking color and size is selected or not
      if (selectedColor && selectedSize) {
        // checking btn is with counter or not
        if (withCounter) {
          addedItem
            ? dispatch(removeFromCart(product._id))
            : dispatch(
                addToCart({
                  ...product,
                  selectedColor,
                  selectedSize,
                  amount: countValue,
                })
              );
        } else {
          dispatch(
            addToCart({
              ...product,
              selectedColor,
              selectedSize,
              amount: countValue,
            })
          );
        }
      } else {
        // when color and size is not selected redirect to the product page
        router.push(`/products/${product._id}`);
      }
    } else {
      // if shop category is not clothing
      if (withCounter) {
        addedItem
          ? dispatch(removeFromCart(product._id))
          : dispatch(
              addToCart({
                ...product,
                amount: countValue,
              })
            );
      } else {
        dispatch(
          addToCart({
            ...product,
            selectedColor,
            selectedSize,
            amount: 1,
          })
        );
      }
    }
  };

  // disable the btn when no color or size is selected
  useEffect(() => {
    if (product?.shop_category === "clothing") {
      if (selectedColor && selectedSize) {
        setDisableBtn(false);
      } else {
        setDisableBtn(true);
      }
    } else {
      setDisableBtn(false);
    }
  }, [selectedColor, selectedSize, product.shop_category]);

  // counter component
  const Counter = () => (
    <div className="flex w-full sm:w-auto relative z-10 items-center bg-background rounded-lg overflow-hidden border">
      <Button
        type="button"
        variant="outline"
        className="h-9 w-9 rounded-none border-none"
        onClick={() => dispatch(decrementAmount(product._id))}
      >
        -
      </Button>
      <span className="px-3 flex-1 text-center">{addedItem?.amount}</span>
      <Button
        type="button"
        variant="outline"
        className="h-9 w-9 rounded-none border-none"
        onClick={() => dispatch(incrementAmount(product._id))}
      >
        +
      </Button>
    </div>
  );

  return (
    <>
      {btnStyle === "withoutCounter" && (
        <Button
          className="flex gap-2 items-center w-fit px-5 text-sm sm:basis-1/2 sm:w-auto sm:text-base"
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={disableBtn}
        >
          <span className="text-lg">
            <FaShoppingCart />
          </span>
          <span>{addedItem ? "Added" : "Add to cart"}</span>
        </Button>
      )}

      {btnStyle === "style-1" && (
        <>
          {!addedItem ? (
            <Button
              className="w-full flex gap-2 items-center text-xs sm:text-base relative z-10"
              type="button"
              onClick={() => handleAddToCart(false)}
            >
              <span className="text-lg">
                <FaShoppingCart />
              </span>
              <span>Add To Cart</span>
            </Button>
          ) : (
            <Counter />
          )}
        </>
      )}

      {btnStyle === "style-2" && (
        <>
          {!addedItem ? (
            <Button
              type="button"
              className="bg-transparent border-input text-primary flex gap-2 items-center rounded-3xl hover:bg-primary hover:text-white text-xs sm:text-base w-full sm:w-auto relative z-10"
              onClick={() => handleAddToCart(false)}
            >
              <span className="text-xl">
                <PiBasketFill />
              </span>
              <span>Cart</span>
            </Button>
          ) : (
            <Counter />
          )}
        </>
      )}

      {btnStyle === "style-3" && (
        <>
          {!addedItem ? (
            <Button
              className="hover:bg-primary hover:text-white"
              type="button"
              variant="outline"
              title="Add to cart"
              onClick={() => handleAddToCart(false)}
            >
              <span className="text-sm sm:text-base">Add To Cart</span>
            </Button>
          ) : (
            <Counter />
          )}
        </>
      )}
      {btnStyle === "style-4" && (
        <>
          {!addedItem ? (
            <Button
              className="h-8 w-full sm:w-8 hover:bg-primary hover:text-white"
              type="button"
              variant="outline"
              title="Add to cart"
              onClick={() => handleAddToCart(false)}
            >
              <span className="text-lg">+</span>
            </Button>
          ) : (
            <Counter />
          )}
        </>
      )}
    </>
  );
};

export default AddToCartBtnWrapper;
