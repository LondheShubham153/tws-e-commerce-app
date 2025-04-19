import Image from "next/image";
import Link from "next/link";
import AddToCartBtnWrapper from "../AddToCartWrapper";
import { discountPercent } from "@/lib/utils";

const CardFour = ({
  _id,
  title,
  image,
  price,
  oldPrice,
  unit_of_measure,
  shop_category,
}: AllProduct) => {
  return (
    <div className="clothing-card bg-secondary p-3 md:p-4 rounded-lg relative hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      {/* discount */}
      {oldPrice && (
        <p className="discount absolute top-3 right-3 sm:top-5 sm:right-5 text-xs px-2 py-1 rounded-md bg-green-600 text-white">
          -{discountPercent(price, oldPrice)}
        </p>
      )}
      <Link href={`/products/${_id}`}>
        <div className="img rounded-sm overflow-hidden">
          <Image
            src={image[0]}
            width={500}
            height={500}
            alt={title}
            className="bg-accent"
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
      <div className="flex justify-between items-center mt-2 gap-2 flex-wrap">
        <p className="flex gap-2 items-end">
          <span className="">${price.toFixed(2)}</span>
          {oldPrice && (
            <del className="text-sm text-gray-400">${oldPrice.toFixed(2)}</del>
          )}
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

export default CardFour;
