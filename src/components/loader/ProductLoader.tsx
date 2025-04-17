import React from "react";
import Skeleton from "./Skeleton";

const ProductLoader = () => {
  return (
    <div className="grid-layout pt-6">
      {[...Array(20)].map((_, index) => (
        <div className="p-2.5 md:p-4 rounded-lg bg-secondary" key={index}>
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-3xl mt-3" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-16 rounded-3xl mt-3" />
            <Skeleton className="h-7 w-20 rounded-3xl mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductLoader;
