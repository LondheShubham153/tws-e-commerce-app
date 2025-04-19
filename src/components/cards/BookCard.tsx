import Image from "next/image";
import React from "react";
import AddToCartBtnWrapper from "../AddToCartWrapper";
import Link from "next/link";

const BookCard = ({
  _id,
  title,
  price,
  oldPrice,
  authors,
  image,
  unit_of_measure,
  shop_category,
  description,
  categories,
  rating,
  amount,
}: BooksProduct) => {
  return (
    <div className="book-card bg-secondary p-4 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <Link href={`/products/${_id}`}>
        <div className="rounded-sm overflow-hidden">
          <Image src={image[0]} width={600} height={880} alt={title} />
        </div>
        <div className="mt-3">
          <h3 className="line-clamp-1">{title}</h3>
          <p className="text-muted-foreground mt-1">
            By{" "}
            {authors.map((author, index) => (
              <span key={author}>
                {index > 0 && index === authors.length - 1 && (
                  <span> and </span>
                )}
                {index > 0 && index < authors.length - 1 && <span>, </span>}
                {author}
              </span>
            ))}
          </p>
        </div>
      </Link>

      <div className="flex gap-2 items-center justify-between mt-1 flex-wrap">
        <p className="flex gap-2 items-end font-semibold text-lg">
          <span>${price.toFixed(2)}</span>
          {oldPrice && (
            <del className="text-sm text-muted-foreground">
              ${oldPrice.toFixed(2)}
            </del>
          )}
        </p>

        <AddToCartBtnWrapper
          product={{
            _id,
            title,
            description: description || "",  
            image,
            price,
            oldPrice,
            authors,
            categories: categories || [],  
            rating: rating || 0,      
            amount: amount || 1,      
            unit_of_measure,
            shop_category,
          }}
          btnStyle="style-4"
        />
      </div>
    </div>
  );
};

export default BookCard;
