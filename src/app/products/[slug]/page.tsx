import RelatedProducts from "@/components/RelatedProducts";
import SingleProduct from "@/components/SingleProduct";
import ProductLoader from "@/components/loader/ProductLoader";
import fetchData from "@/lib/fetchDataFromApi";
import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";

type SingleProductPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata(
  { params }: SingleProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const slug = params.slug;

  // fetch data
  const res = await fetchData.get(`/singleProduct/${slug}`);
  const product: SingleProductType | null = res.data || null;

  return {
    title: product ? product?.title : "Product Not Found",
    description: product?.description,
  };
}

const SingleProductPage = async ({
  params: { slug },
}: SingleProductPageProps) => {
  const res = await fetchData.get(`/singleProduct/${slug}`);
  const product: SingleProductType | null = res.data || null;

  return (
    <section className="single-product-page bg-secondary dark:bg-background">
      {product && <SingleProduct product={product} />}
      {!product && (
        <div className="h-screen w-full flex justify-center items-center text-3xl font-semibold text-center">
          Product Not Found
        </div>
      )}

      <Suspense
        fallback={
          <div className="container">
            <ProductLoader />
          </div>
        }
      >
        <div className="bg-accent pb-20 pt-10">
          <div className="container">
            <h1 className="mb-7 text-3xl font-semibold">You May Also like</h1>
            <div className="grid-layout">
              {product &&
                product?.categories.map((item) => (
                  <RelatedProducts
                    shop_category={product.shop_category}
                    category={item}
                    key={item}
                  />
                ))}
            </div>
          </div>
        </div>
      </Suspense>
    </section>
  );
};

export default SingleProductPage;
