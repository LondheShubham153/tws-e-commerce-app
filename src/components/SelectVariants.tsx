"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addToCart,
  handleColorChange,
  handleSizeChange,
} from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import Image from "next/image";
import { useDispatch } from "react-redux";
import colors from "@/data/colors.json";
import { useEffect, useState } from "react";
import Skeleton from "./loader/Skeleton";

// const defaultSizes = ["XS", "SM", "MD", "LG", "XL", "XXL"];

type SelectVariantsProps = {
  productId: string;
  colors?: string[];
  sizes?: string[];
};

export default function SelectVariants({
  colors: givenColors,
  sizes,
  productId,
}: SelectVariantsProps) {
  const dispatch = useDispatch();
  const [isClient, setIsClient] = useState(false);
  const { cartItems, selectedColor, selectedSize } = useAppSelector(
    (state) => state.cartSlice
  );

  // find the added item in carts
  const cartItem = cartItems.find((item) => item._id === productId);

  // filtering which colors are available
  const availableColors = colors.filter((col) =>
    givenColors?.includes(col.title.toLowerCase())
  );

  // handle color change
  const onColorChange = (value: string) => {
    dispatch(handleColorChange(value));
    if (cartItem) {
      dispatch(addToCart(cartItem));
    }
    return;
  };

  // handle size change
  const onSizeChange = (value: string) => {
    dispatch(handleSizeChange(value));
    if (cartItem) {
      dispatch(addToCart(cartItem));
    }
    return;
  };

  useEffect(() => {
    setIsClient(true);

    return () => {};
  }, []);

  // color select component

  if (isClient) {
    if (givenColors) {
      return (
        <Select
          onValueChange={onColorChange}
          value={cartItem?.selectedColor || selectedColor || ""}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a color" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select a Color</SelectLabel>
              {availableColors.map((color) => (
                <SelectItem
                  value={color.title}
                  key={color.title}
                  className="cursor-pointer"
                >
                  <div className="flex gap-2 items-center">
                    <Image
                      src={color.img}
                      alt={color.title}
                      width={20}
                      height={20}
                      className="border rounded-full"
                    />
                    <p className="capitalize">{color.title}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      // size select component
    } else if (sizes) {
      return (
        <Select
          onValueChange={onSizeChange}
          value={cartItem?.selectedSize || selectedSize || ""}
        >
          <SelectTrigger className="w-fit">
            <SelectValue placeholder="Select a size" />
          </SelectTrigger>
          <SelectContent className="w-fit max-w-fit">
            <SelectGroup>
              <SelectLabel>Select a Size</SelectLabel>
              {sizes.map((size) => {
                let sizeLabel = "";

                switch (size.toLowerCase()) {
                  case "xs":
                    sizeLabel = "extra-small";
                    break;
                  case "sm":
                    sizeLabel = "small";
                    break;
                  case "md":
                    sizeLabel = "medium";
                    break;
                  case "lg":
                    sizeLabel = "large";
                    break;
                  case "xl":
                    sizeLabel = "extra-large";
                    break;
                  case "xxl":
                    sizeLabel = "2extra-large";
                    break;
                  default:
                    sizeLabel = sizeLabel;
                }
                return (
                  <SelectItem
                    value={size}
                    key={size}
                    className="cursor-pointer"
                  >
                    <div className="flex gap-2 items-center">
                      <p className="uppercase">{size}</p>
                      <p className="text-sm">({sizeLabel})</p>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }
  } else return <Skeleton className="h-10 w-[140px] rounded-lg bg-secondary" />;
}
