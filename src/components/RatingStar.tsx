import { cn } from "@/lib/utils";
import React from "react";
import { MdOutlineStar, MdOutlineStarBorder } from "react-icons/md";

type RatingStarProps = {
  ratingNumber: number;
  className?: string;
};

const RatingStar = ({ ratingNumber, className }: RatingStarProps) => {
  return (
    <div className={cn("flex gap-1 items-center text-lg", className)}>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="relative">
          {ratingNumber > index && (
            <MdOutlineStar
              key={index}
              className="text-yellow-400 absolute top-0 left-0"
            />
          )}
          <MdOutlineStarBorder key={index} className="text-yellow-400" />
        </div>
      ))}
    </div>
  );
};

export default RatingStar;
