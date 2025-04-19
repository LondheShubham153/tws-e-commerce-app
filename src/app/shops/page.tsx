import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const shops = [
  {
    title: "Books Shop",
    image: "/icons/books.png",
    link: "/shops/books",
  },
  {
    title: "Bakery Shop",
    image: "/icons/bakery.png",
    link: "/shops/bakery",
  },
  {
    title: "Bags Shop",
    image: "/icons/bag.png",
    link: "/shops/bags",
  },
  {
    title: "Clothing Shop",
    image: "/icons/bakery.png",
    link: "/shops/clothing",
  },
  {
    title: "Furnitures Shop",
    image: "/icons/furniture.png",
    link: "/shops/furniture",
  },
  {
    title: "Gadgets Shop",
    image: "/icons/gadgets.png",
    link: "/shops/gadgets",
  },
  {
    title: "Grocery Shop",
    image: "/icons/grocery.png",
    link: "/shops/grocery",
  },
  {
    title: "Makeup Shop",
    image: "/icons/makeup.png",
    link: "/shops/makeup",
  },
  {
    title: "Medicine Shop",
    image: "/icons/medicine.png",
    link: "/shops/medicine",
  },
];

export const metadata: Metadata = {
  title: "All Shops",
  description:
    "EasyShop is the user-friendly Next.js eCommerce template perfect for launching your online store. With its clean design and customizable options, EasyShop makes selling online a breeze. Start building your dream store today and boost your online presence effortlessly!",
};

const ShopsPage = () => {
  return (
    <div className="pb-20 pt-10">
      <h1 className="mb-6 container text-2xl font-semibold">All Shops</h1>

      <div className="grid gap-6 grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 container">
        {shops.map((shop) => (
          <Link
            href={`${shop.link}`}
            key={shop.title}
            className="text-center flex flex-col items-center bg-secondary p-5 rounded-lg hover:scale-105 border hover:border-primary transition-all duration-200"
          >
            <Image
              src={shop.image}
              width={100}
              height={100}
              alt={shop.title}
              className="rounded-full"
            />

            <h2 className="text-xl mt-3 font-semibold">{shop.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShopsPage;
