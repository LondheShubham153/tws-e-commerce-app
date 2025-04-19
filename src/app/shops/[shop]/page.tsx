import ProductGrid from "@/components/ProductGrid";
import SelectedFilters from "@/components/filters/SelectedFilters";
import ProductLoader from "@/components/loader/ProductLoader";
import { Suspense } from "react";

type ShopPageProps = {
  searchParams: SearchParamsType;
  params: {
    shop: string;
    category: string;
  };
};

const ShopPage = ({ params, searchParams }: ShopPageProps) => {
  return (
    <section className="shop-page">
      <SelectedFilters />
      <Suspense
        key={searchParams?.page + params.shop + searchParams?.q}
        fallback={<ProductLoader />}
      >
        <ProductGrid searchParams={searchParams} params={params} />
      </Suspense>
    </section>
  );
};

export default ShopPage;
