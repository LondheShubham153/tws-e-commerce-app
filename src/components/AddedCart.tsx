"use client";

import colors from "@/data/colors.json";
import { handleCartOpen, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import { totalPrice } from "@/lib/utils";
import { AnimatePresence, Variants, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BsCartCheckFill } from "react-icons/bs";
import { HiMiniXMark } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { Button } from "./ui/button";

const ContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: "100%",
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      type: "tween",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      stiffness: 90,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
  },
};

const AddedCart = () => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { cartItems, isCartOpen } = useAppSelector((state) => state.cartSlice);
  const { isAuthenticated } = useAppSelector((state) => state.authSlice);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isHidden =
    pathname.includes("contact") ||
    pathname.includes("profile") ||
    pathname.includes("checkout");

  const reversedItems = [...cartItems].reverse();

  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isAuthenticated) {
      router.push('/checkout');
      dispatch(handleCartOpen());
    } else {
      router.push(`/login?redirect=${encodeURIComponent('/checkout')}`);
      dispatch(handleCartOpen());
    }
  };

  return (
    <>
      <div
        className={`${
          isHidden ? "hidden" : "hidden md:block"
        } fixed top-1/2 right-0 -translate-y-1/2 bg-secondary p-3 text-sm rounded-lg z-50 cursor-pointer shadow-lg border`}
        onClick={() => dispatch(handleCartOpen())}
      >
        <div className="flex gap-2 items-center">
          <span className="text-xl">
            <BsCartCheckFill />
          </span>
          <span>Items {isClient ? cartItems.length : 0}</span>
        </div>

        <div className="price rounded-lg bg-primary px-2 py-1 mt-2 text-center text-white">
          <p>${isClient ? totalPrice(cartItems) : 0}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isCartOpen && (
          <motion.div
            variants={ContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="card-sidebar fixed top-0 right-0 w-full h-screen z-50 flex justify-end"
          >
            <div
              className="fixed top-0 left-0 w-full h-full bg-black/40"
              onClick={() => dispatch(handleCartOpen())}
            ></div>

            <motion.div
              variants={itemVariants}
              className="w-full sm:max-w-[360px] h-full z-20 relative flex flex-col justify-between bg-secondary"
            >
              {/* header */}
              <div className="flex border-b px-default py-3 justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    <BsCartCheckFill />
                  </span>
                  <span>Item {cartItems.length}</span>
                </div>

                <Button
                  type="button"
                  className="rounded-full h-10 w-10 p-0 text-xl hover:border-primary hover:text-primary"
                  variant="outline"
                  onClick={() => dispatch(handleCartOpen())}
                >
                  <HiMiniXMark />
                </Button>
              </div>
              {/* cart items */}
              <div className="flex-1 overflow-auto pb-3">
                <ul className="px-3">
                  {isClient &&
                    reversedItems.map((c) => {
                      const colorImg = colors.find(
                        (col) =>
                          col.title.toLowerCase() ===
                          c.selectedColor?.toLowerCase()
                      );
                      return (
                        <motion.li
                          variants={item}
                          layout
                          className="relative"
                          key={c._id}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            className="absolute top-0 right-2 h-7 w-7 p-0 text-base rounded-full hover:text-primary hover:border-primary"
                            onClick={() => dispatch(removeFromCart(c._id))}
                          >
                            <HiMiniXMark />
                          </Button>
                          <Link
                            href={`/products/${c._id}`}
                            className="flex gap-3 items-center mt-3 p-2 hover:bg-accent rounded-xl overflow-hidden"
                            onClick={() => dispatch(handleCartOpen())}
                          >
                            <div className="flex gap-3 w-full">
                              <Image
                                src={c.image[0] || '/placeholder.jpg'}
                                width={70}
                                height={70}
                                alt={c.title}
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1 flex justify-between gap-4 items-center">
                                <div className="h-full">
                                  <h3 className="font-semibold line-clamp-1">
                                    {c.title}
                                  </h3>
                                  <p className="mt-1 flex gap-2 items-center">
                                    <span className="text-primary">
                                      ${c.price}
                                    </span>
                                    <span>*</span>
                                    <span>
                                      {c.amount} {c.unit_of_measure}
                                    </span>
                                  </p>
                                  {(c?.selectedColor || c?.selectedSize) && (
                                    <div className="flex gap-2 text-sm items-center mt-2">
                                      <p>
                                        <strong>Size: </strong>
                                        <span>{c.selectedSize}</span>
                                      </p>
                                      <p
                                        title={c?.selectedColor}
                                        className="flex gap-1 items-center"
                                      >
                                        <strong>Color: </strong>
                                        <Image
                                          src={colorImg?.img || ""}
                                          alt={colorImg?.title || ""}
                                          width={20}
                                          height={20}
                                          className="rounded-full border bg-gray-600"
                                        />
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <p className="font-semibold">
                                  $
                                  {(Number(c.price) * (c?.amount || 1)).toFixed(
                                    2
                                  )}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </motion.li>
                      );
                    })}
                </ul>
              </div>

              {/* footer */}
              <div className="px-default pb-3">
                <Button
                  className="rounded-2xl pl-4 pr-1.5 bg-primary w-full flex justify-between items-center py-1.5 font-semibold text-white"
                  onClick={handleCheckoutClick}
                >
                  <span>{isAuthenticated ? 'Checkout' : 'Login to Checkout'}</span>
                  <span className="px-3 py-2 rounded-[12px] bg-white text-black">
                    ${totalPrice(cartItems)}
                  </span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddedCart;
