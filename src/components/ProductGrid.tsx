import fetchData from "@/lib/fetchDataFromApi";
import layoutSettings from "@/lib/layoutSettings";
import NoProductFound from "./NoProductFound";
import Paginations from "./Paginations";
import ProductCard from "./cards/ProductCard";
import type { AllProduct } from "@/types/product";

type CategoryPageProps = {
  searchParams: SearchParamsType;
  params: {
    category: string;
    shop: string;
  };
};

const ProductGrid = async ({ params, searchParams }: CategoryPageProps) => {
  try {
    const { shop, category } = params;
    
    const queryParams = {
      page: searchParams?.page || "1",
      q: searchParams?.q || "",
      sort: searchParams?.sort || "",
      order: searchParams?.order || "",
      color: searchParams?.color || "",
      minPrice: searchParams?.minPrice || "",
      maxPrice: searchParams?.maxPrice || "",
      shop_category: shop,
      ...(category && { categories: category })
    };

    const res = await fetchData.get('/products', queryParams);
    const products = (res.data?.products || []) as AllProduct[];
    const totalCount = res.data?.total || 0;
    const settings = layoutSettings?.[shop] || { productCardVariants: 'style-1' };

    if (products.length === 0) {
      return <NoProductFound />;
    }

    return (
      <>
        <div className="grid-layout pt-6">
          {products.map((product) => (
            <ProductCard
              product={product}
              variants={settings.productCardVariants}
              key={product._id}
            />
          ))}
        </div>
        <Paginations
          totalCount={totalCount}
          currentPage={Number(queryParams.page)}
          totalPages={Math.ceil(totalCount / 10)}
        />
      </>
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return <NoProductFound />;
  }
};

export default ProductGrid;
