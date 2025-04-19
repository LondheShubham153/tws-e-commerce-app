"use client";

import { toggleToWishlists } from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import { AnimatePresence, Variants, motion } from "framer-motion";
import { IoIosHeartEmpty, IoMdHeart } from "react-icons/io";
import { useDispatch } from "react-redux";

const ContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
  },
};

type AddToWishlistProps = {
  product: AllProduct;
};

const AddToWishlist = ({ product }: AddToWishlistProps) => {
  const { wishlists } = useAppSelector((state) => state.cartSlice);
  const dispatch = useDispatch();

  const isProductInWishlist = wishlists.some(
    (wishlist) => wishlist._id === product._id
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        variants={ContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="text-2xl rounded-full min-h-10 min-w-10 p-0 border cursor-pointer bg-accent border-primary flex justify-center items-center"
        onClick={() => dispatch(toggleToWishlists(product))}
      >
        {isProductInWishlist && (
          <motion.div className="text-primary" variants={item}>
            <IoMdHeart />
          </motion.div>
        )}

        {!isProductInWishlist && (
          <motion.div variants={item}>
            <IoIosHeartEmpty />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AddToWishlist;
