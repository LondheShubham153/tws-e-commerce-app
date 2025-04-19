"use client";
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
import { cn } from "@/lib/utils";

type BannerSliderProps = {
  bannerImages: { img: string }[];
  className?: string;
};

const BannerSlider = ({ bannerImages, className }: BannerSliderProps) => {
  return (
    <div className={cn("container mt-10", className)}>
      <Carousel
        plugins={[
          AutoPlay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent>
          {bannerImages.map((item, index) => (
            <CarouselItem
              className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              key={index}
            >
              <Image
                width={600}
                height={400}
                alt={"banner"}
                src={item.img}
                className="w-full h-auto"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default BannerSlider;
