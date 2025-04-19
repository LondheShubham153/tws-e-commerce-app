"use client";

import Image from "next/image";
import Link from "next/link";
import AddToCartBtnWrapper from "../AddToCartWrapper";
import AddToWishlist from "../AddToWishlist";

const WishlistCard = (props: AllProduct) => {
  const { _id, title, price, image, oldPrice, unit_of_measure, shop_category } =
    props;
  return (
    <div className="wishlist-card bg-secondary p-2.5 md:p-4 rounded-lg relative hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border">
      <div className="absolute top-3 right-3">
        <AddToWishlist product={props} />
      </div>
      <Link href={`/products/${_id}`}>
        <div className="img">
          <Image
            src={image[0]}
            width={500}
            height={500}
            alt={title}
            className="bg-accent rounded-sm"
          />

          <div className="content mt-2 font-semibold">
            <h2
              className="line-clamp-1 text-gray-700 dark:text-gray-300"
              title={title}
            >
              {title}
            </h2>
          </div>
        </div>
      </Link>
      <div className="flex justify-between items-center flex-wrap  gap-3">
        <p className="flex gap-2 items-end">
          <span className="">${price}</span>
          {oldPrice && <del className="text-sm text-gray-400">${oldPrice}</del>}
        </p>
        <AddToCartBtnWrapper
          btnStyle="style-4"
          product={{
            _id,
            title,
            description: "",
            image,
            price,
            oldPrice,
            categories: [],
            rating: 0,
            amount: 1,
            unit_of_measure,
            shop_category,
          }}
        />
      </div>
    </div>
  );
};

export default WishlistCard;
