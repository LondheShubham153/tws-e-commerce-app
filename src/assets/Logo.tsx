import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaOpencart } from "react-icons/fa";

const Logo = () => {
  return (
    <Link href={"/"} className="flex gap-3 items-center">
      <span className="text-4xl text-primary">
        <FaOpencart />
      </span>
      <div>
        <p className="text-xl font-semibold whitespace-nowrap">
          Easy <span className="text-primary">Shop</span>
        </p>
        {/* <p className="text-xs">Enjoy shopping</p> */}
      </div>
    </Link>
  );
};

export default Logo;
