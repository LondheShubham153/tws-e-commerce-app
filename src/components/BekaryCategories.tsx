"use client";

import Link from "next/link";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import AutoPlay from "embla-carousel-autoplay";
import Image from "next/image";
import categories from "@/data/categories.json";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type BekaryCategoriesProps = {
  hidenameLink?: boolean;
  className?: string;
};

const BekaryCategories = ({
  hidenameLink = false,
  className,
}: BekaryCategoriesProps) => {
  const pathname = usePathname();

  return (
    <section className="bekary-category pt-10 pb-6">
      <div className={cn("container", className)}>
        {!hidenameLink && (
          <div className="flex justify-between items-center gap-4 flex-wrap mb-6">
            <h1 className="text-2xl md:text-4xl font-semibold">
              Explore your bekary items
            </h1>
            <Link
              href={"/shops/bakery"}
              className="hover:underline text-primary"
            >
              View Shop
            </Link>
          </div>
        )}
        <Carousel
          plugins={[
            AutoPlay({
              delay: 6000,
            }),
          ]}
        >
          <CarouselContent>
            {categories.categories.bakery.map((item, index) => (
              <CarouselItem
                className="basis-1/3 md:basis-1/5 lg:basis-[14.3%] xl:basis-[12.5%] text-center"
                key={index}
              >
                <Link
                  href={item.search_link}
                  className={`${
                    pathname === item.search_link ? "text-primary" : ""
                  } hover:text-primary transition-all duration-300`}
                >
                  <Image
                    width={400}
                    height={400}
                    alt={item.name}
                    src={item.img}
                    className={`${
                      pathname === item.search_link
                        ? "transition-all duration-300 border border-primary shadow-lg"
                        : ""
                    } rounded-full`}
                  />
                  <h4 className="mt-1 text-sm md:text-lg">{item.name}</h4>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </section>
  );
};

export default BekaryCategories;
