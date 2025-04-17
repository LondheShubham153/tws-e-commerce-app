import React from "react";
import Wishlists from "./Wishlists";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlists",
  description:
    "EasyShop is the user-friendly Next.js eCommerce template perfect for launching your online store. With its clean design and customizable options, EasyShop makes selling online a breeze. Start building your dream store today and boost your online presence effortlessly!",
};

const WishlistPage = () => {
  return <Wishlists />;
};

export default WishlistPage;
