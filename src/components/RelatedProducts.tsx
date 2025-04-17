import fetchData from "@/lib/fetchDataFromApi";
import layoutSettings from "@/lib/layoutSettings";
import { rgx } from "@/lib/utils";
import ProductCard from "./cards/ProductCard";

type RelatedProductsProps = {
  category: string;
  shop_category: string;
};

const RelatedProducts = async ({
  category,
  shop_category,
}: RelatedProductsProps) => {
  const res = await fetchData.get(`/products/${shop_category}/${category}`, {
    limit: "5",
  });

  const products: AllProduct[] = res.data.products || [];
  const settings = layoutSettings?.[shop_category];

  return (
    <>
      {products.map((product) => (
        <ProductCard
          product={product}
          variants={settings.productCardVariants}
          key={product._id}
        />
      ))}
    </>
  );
};

export default RelatedProducts;
