import { discountPercent } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import AddToCartBtnWrapper from "../AddToCartWrapper";

const CardOne = ({
  _id,
  title,
  price,
  image,
  oldPrice,
  unit_of_measure,
  shop_category,
}: AllProduct) => {
  return (
    <div className="card-one bg-secondary p-3 md:p-4 rounded-lg relative hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <Link
        href={`/products/${_id}`}
        className="absolute top-0 left-0 w-full h-full"
      />
      {/* discount */}
      {oldPrice && (
        <p className="discount absolute top-3 right-3 sm:top-5 sm:right-5 text-xs px-2 py-1 rounded-md bg-green-600 text-white">
          -{discountPercent(price, oldPrice)}
        </p>
      )}

      <div className="img rounded-sm overflow-hidden">
        <Image
          src={image[0]}
          width={500}
          height={500}
          alt={title}
          className="bg-accent"
        />

        <div className="content mt-2 font-semibold text-sm sm:text-base">
          <h2
            className="line-clamp-1 text-gray-700 dark:text-gray-300"
            title={title}
          >
            {title}
          </h2>
          <p className="mt-1 flex gap-2 items-end">
            <span className="">${price.toFixed(2)}</span>
            {oldPrice && (
              <del className="text-sm text-gray-400">
                ${oldPrice.toFixed(2)}
              </del>
            )}
          </p>

          <div className="mt-3">
            <AddToCartBtnWrapper
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
      </div>
    </div>
  );
};

export default CardOne;
