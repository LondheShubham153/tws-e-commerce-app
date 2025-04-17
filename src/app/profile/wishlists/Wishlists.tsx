"use client";

import WishlistCard from "@/components/cards/WishlistCard";
import { useAppSelector } from "@/lib/hooks";
import { AnimatePresence, Variants, motion } from "framer-motion";

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      stiffness: 90,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
  },
};

const Wishlists = () => {
  const { wishlists } = useAppSelector((state) => state.cartSlice);

  return (
    <AnimatePresence>
      <div className="">
        {wishlists.length === 0 && (
          <motion.div
            variants={item}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-screen w-full flex justify-center items-center text-center text-2xl font-medium"
          >
            <p>No wishlist found!</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
          {wishlists.map((w) => (
            <motion.div key={w._id} layout>
              <WishlistCard {...w} />
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatePresence>
  );
};

export default Wishlists;
