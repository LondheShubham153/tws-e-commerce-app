import { EmblaOptionsType } from "embla-carousel";
import Link from "next/link";
import AddToCartBtnWrapper from "./AddToCartWrapper";
import AddToWishlist from "./AddToWishlist";
import Counter from "./Counter";
import HistoryBackBtn from "./HistoryBackBtn";
import RatingStar from "./RatingStar";
import ProductImageSlider from "./sliders/ProductImageSlider";
import SelectVariants from "./SelectVariants";

type SingleProductProps = {
  product: SingleProductType;
};

const OPTIONS: EmblaOptionsType = {};

const SingleProduct = ({ product }: SingleProductProps) => {
  const {
    _id,
    title,
    image,
    shop_category,
    categories,
    unit_of_measure,
    price,
    rating,
  } = product;

  return (
    <div className="container pb-16 pt-10">
      <HistoryBackBtn />
      <div className="flex gap-10 mt-6 flex-col md:flex-row">
        <div className="img w-full md:w-2/5 max-w-md mx-auto">
          <ProductImageSlider images={image} options={OPTIONS} />
        </div>

        <div className="right w-full md:w-3/5">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-semibold">{title}</h1>
            <AddToWishlist product={product} />
          </div>

          <RatingStar ratingNumber={rating} className="mt-2" />
          <div className="flex gap-3 items-end mt-4">
            <p className="text-2xl text-primary font-semibold">
              ${product.price.toFixed(2)}
            </p>
            {product?.oldPrice && (
              <del className="text-gray-400 font-semibold">
                ${product.oldPrice.toFixed(2)}
              </del>
            )}
          </div>

          {product?.amount && (
            <p className="mt-4 first-letter:capitalize">
              availale {product?.amount} {product?.unit_of_measure}
            </p>
          )}

          <p className="mt-4 text-muted-foreground">{product?.description}</p>

          <div className="flex gap-x-4 items-center flex-wrap">
            {product?.colors && (
              <div className="mt-4">
                <SelectVariants colors={product.colors} productId={_id} />
              </div>
            )}

            {product?.sizes && (
              <div className="mt-4">
                <SelectVariants sizes={product.sizes} productId={_id} />
              </div>
            )}
          </div>
          <div className="flex gap-4 items-center mt-5">
            <Counter
              quantity={product?.amount}
              product={{
                _id,
                title,
                image: [image[0]],
                price,
                unit_of_measure,
                shop_category,
              }}
            />

            <AddToCartBtnWrapper
              btnStyle="withoutCounter"
              product={{
                _id,
                title,
                description: product.description || "",
                price,
                categories: product.categories || [],
                image,
                unit_of_measure,
                shop_category,
              }}
            />
          </div>

          <p className="mt-7 flex gap-2 items-center flex-wrap whitespace-nowrap">
            <strong>Categories:</strong>
            {categories.map((item) => (
              <Link
                href={`/shops/${shop_category}/${item}`}
                key={item}
                className="py-1 px-2 rounded-sm border text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </p>

          <p className="mt-4 flex gap-2 items-center">
            <strong>Shop:</strong>
            <Link
              href={`/shops/${shop_category}`}
              className="text-muted-foreground capitalize hover:underline hover:text-primary"
            >
              {shop_category}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
