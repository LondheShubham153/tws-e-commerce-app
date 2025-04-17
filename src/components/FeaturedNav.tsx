"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const shops = [
  { title: "gadgets", icon: "/icons/gadgets.png" },
  { title: "grocery", icon: "/icons/grocery.png" },
  { title: "bakery", icon: "/icons/bakery.png" },
  { title: "clothing", icon: "/icons/clothing.png" },
  { title: "makeup", icon: "/icons/makeup.png" },
  { title: "bags", icon: "/icons/bag.png" },
  { title: "furniture", icon: "/icons/furniture.png" },
  { title: "books", icon: "/icons/books.png" },
  { title: "medicine", icon: "/icons/medicine.png" },
  { title: "snacks", icon: "/icons/grocery.png" }, // Using grocery icon for snacks
  { title: "beauty", icon: "/icons/makeup.png" }  // Using makeup icon for beauty
];

const FeaturedNav = () => {
  const searchParams = useSearchParams();
  const activeShop = searchParams.get("featured") || "gadgets";

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <AnimatePresence>
        {shops.map((shop) => (
          <Link
            href={`?featured=${shop.title.toLowerCase()}`}
            type="button"
            scroll={false}
            key={shop.title}
            className={`${
              shop.title === activeShop ? "text-primary" : ""
            } flex items-center px-2 py-1 hover:text-primary transition-colors duration-150 capitalize relative`}
          >
            <Image src={shop.icon} height={40} width={40} alt={shop.title} />
            <span>{shop.title}</span>

            {shop.title === activeShop && (
              <motion.div
                layout
                layoutId="underline"
                className="absolute left-0 bottom-0 w-full h-0.5 bg-primary rounded-lg"
              />
            )}
          </Link>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FeaturedNav;
