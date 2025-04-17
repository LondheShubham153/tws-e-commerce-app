"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import FeaturedNav from "./FeaturedNav";
import ProductCard from "./cards/ProductCard";
import Skeleton from "./loader/Skeleton";

type FeaturedParams = {
  featured?: string;
};

type AllProduct = {
  _id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  categories: string[];
  image: string[];
  rating: number;
  amount: number;
  shop_category: string;
  unit_of_measure: string;
};

const categoryMap: { [key: string]: string } = {
  gadgets: 'gadgets',
  electronics: 'gadgets',
  clothing: 'clothing',
  grocery: 'grocery',
  medicine: 'medicine',
  bags: 'bags',
  makeup: 'makeup',
  books: 'books',
  bakery: 'bakery'
};

const FeaturedProducts = ({ featured }: FeaturedParams) => {
  const [products, setProducts] = useState<AllProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const activeShop = featured || "gadgets";
        const res = await fetch(`/api/products/featured?category=${activeShop}`);
        const data = await res.json();
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [featured]);

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <section className="featured-products py-10 w-full">
      <div className="container">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-5">
          Best sellers in{" "}
          <Link
            href={`/shops/${featured || "gadgets"}`}
            className="text-primary hover:underline"
          >
            {featured || "gadgets"}
          </Link>{" "}
          products
        </h1>
        <FeaturedNav />
        <div className="grid gap-4 grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6">
          {products.map((product: AllProduct) => (
            <ProductCard key={product._id} product={product} variants="style-2" />
          ))}
        </div>

        <div className="mt-7 flex justify-center w-full">
          <Link
            type="button"
            href={`/shops/${featured || "gadgets"}`}
            className="py-3 px-4 rounded-lg border bg-primary uppercase font-medium hover:bg-transparent border-primary transition-all duration-150"
          >
            View More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
