import { cn } from "@/lib/utils";
import React from "react";

const LoaderDots = ({ className }: { className?: string }) => {
  return (
    <div className={cn("", className)}>
      <div className="loader_dots">
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
        <div className="circle" />
      </div>
    </div>
  );
};

export default LoaderDots;
