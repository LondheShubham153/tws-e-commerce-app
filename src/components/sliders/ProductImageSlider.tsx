"use client";

import React, { useState, useEffect, useCallback } from "react";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

type ProductImageSliderProps = {
  images: string[];
  options?: EmblaOptionsType;
};

type ThumbProps = {
  selected: boolean;
  index: number;
  onClick: () => void;
  img: string;
};

const Thumb: React.FC<ThumbProps> = (props) => {
  const { selected, index, onClick, img } = props;

  return (
    <div
      className={"embla-thumbs__slide".concat(
        selected ? " embla-thumbs__slide--selected" : ""
      )}
    >
      <button
        onClick={onClick}
        type="button"
        className="embla-thumbs__slide__number"
        title="img"
      >
        <Image
          src={img}
          width={100}
          height={100}
          alt="product"
          className="w-full h-full object-cover"
        />
      </button>
    </div>
  );
};

const ProductImageSlider: React.FC<ProductImageSliderProps> = (props) => {
  const { images, options } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options);
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  return images.length > 1 ? (
    <div className="embla">
      <div className="embla__viewport" ref={emblaMainRef}>
        <div className="embla__container">
          {images.map((img, index) => (
            <div className="embla__slide border" key={index}>
              <div className="embla__slide__number">
                <Image
                  src={img}
                  width={500}
                  height={500}
                  alt="product"
                  className="rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport" ref={emblaThumbsRef}>
          <div className="embla-thumbs__container">
            {images.map((img, index) => (
              <Thumb
                key={index}
                onClick={() => onThumbClick(index)}
                selected={index === selectedIndex}
                index={index}
                img={img}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <Image
        src={images[0]}
        width={500}
        height={500}
        alt="product"
        className="rounded-lg border"
      />
    </div>
  );
};

export default ProductImageSlider;
