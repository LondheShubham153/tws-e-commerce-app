import HistoryBackBtn from "@/components/HistoryBackBtn";
import Skeleton from "@/components/loader/Skeleton";
import React from "react";

const loading = () => {
  return (
    <div className="flex gap-10 container py-16 flex-col md:flex-row">
      <div className="left w-full md:w-1/3 max-w-md mx-auto">
        <Skeleton className="aspect-square bg-secondary" />
      </div>

      <div className="left w-full md:w-2/3">
        <Skeleton className="h-7 bg-secondary rounded-3xl max-w-sm" />
        <Skeleton className="h-5 mt-4 bg-secondary rounded-3xl max-w-20" />
        <Skeleton className="h-3 mt-5 bg-secondary rounded-3xl" />
        <Skeleton className="h-3 mt-3 bg-secondary rounded-3xl" />
        <Skeleton className="h-3 mt-3 bg-secondary rounded-3xl" />
        <Skeleton className="h-3 mt-3 bg-secondary rounded-3xl max-w-sm" />

        <div className="flex mt-5 gap-4 w-full">
          <Skeleton className="h-10 mt-3 bg-secondary max-w-[200px] w-1/2 rounded-md" />
          <Skeleton className="h-10 mt-3 bg-secondary w-1/2 rounded-md" />
        </div>

        <div className="flex mt-5 gap-4 w-full">
          <Skeleton className="h-5 bg-secondary w-20 rounded-md" />
          <Skeleton className="h-5 bg-secondary w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default loading;
