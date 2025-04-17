"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";

type BookSliderProps = {
  books: BooksProduct[] | [];
};

const BooksSlider = ({ books }: BookSliderProps) => {
  return (
    <Carousel
      plugins={
        [
          // AutoPlay({
          //   delay: 5000,
          // }),
        ]
      }
    >
      <CarouselContent>
        {books?.map((book, index) => (
          <CarouselItem
            className="basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-1/6"
            key={index}
          >
            <Link href={`/products/${book._id}`}>
              <Image
                width={400}
                height={600}
                alt={book.title}
                src={book.image[0]}
                className="rounded-lg"
              />
            </Link>
          </CarouselItem>
        ))}
        {/*
        {loading &&
          [...Array(10)].map((_, index) => (
            <CarouselItem
              className="basis-1/2 sm:basis-1/3 md:basis-1/5 lg:basis-1/6"
              key={index}
            >
              <Skeleton
                key={index}
                className="bg-secondary aspect-[1/1.5] rounded-lg"
              ></Skeleton>
            </CarouselItem>
          ))} */}
      </CarouselContent>
      <CarouselPrevious className="left-0" />
      <CarouselNext className="right-0" />
    </Carousel>
  );
};

export default BooksSlider;
