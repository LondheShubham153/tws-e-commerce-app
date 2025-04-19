"use client";

import { handleCartOpen } from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { BsCartCheckFill } from "react-icons/bs";
import { IoMdHome } from "react-icons/io";
import { RiMenuFoldLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import { FaRegUserCircle } from "react-icons/fa";
import Link from "next/link";
import { toggleProfileNav } from "@/lib/features/sidebar/sidebarSlice";
import MobileProfileNav from "./MobileProfileNav";
import { useRouter } from "next/navigation";

const MobileBottomMenu = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cartItems } = useAppSelector((state) => state.cartSlice);
  const { isAuthenticated } = useAppSelector((state) => state.authSlice);

  const [isClient, setIsClient] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleProfile = () => {
    isAuthenticated ? dispatch(toggleProfileNav()) : router.push("/login");
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 w-full bg-secondary z-20 shadow-lg border-t md:hidden">
        <ul className="flex">
          <li className="w-1/4 hover:bg-accent">
            <button
              title="menu"
              type="button"
              className="text-2xl w-full py-4 flex justify-center items-center"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              <RiMenuFoldLine />
            </button>
          </li>
          <li className="w-1/4 hover:bg-accent">
            <button
              title="menu"
              type="button"
              className="text-2xl w-full py-4 flex justify-center items-center"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <BiSearch />
            </button>
          </li>
          <li className="w-1/4 hover:bg-accent">
            <Link
              href={"/"}
              title="menu"
              type="button"
              className="text-2xl w-full py-4 flex justify-center items-center"
            >
              <IoMdHome />
            </Link>
          </li>

          <li
            className="w-1/4 hover:bg-accent relative"
            onClick={() => dispatch(handleCartOpen())}
          >
            {isClient && cartItems.length > 0 && (
              <span className="absolute top-0 right-3 flex justify-center items-center h-6 w-6 rounded-full bg-primary text-white text-sm font-semibold p-0.5">
                {cartItems.length}
              </span>
            )}
            <button
              title="menu"
              type="button"
              className="text-2xl w-full py-4 flex justify-center items-center"
            >
              <BsCartCheckFill />
            </button>
          </li>

          <li className="w-1/4 hover:bg-accent">
            <button
              title="menu"
              type="button"
              className="text-2xl w-full py-4 flex justify-center items-center"
              onClick={handleProfile}
            >
              <FaRegUserCircle />
            </button>
          </li>
        </ul>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed top-0 left-0 w-full z-50 md:hidden"
            initial={{
              y: "-100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "-100%",
              opacity: 0,
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed top-0 left-0 w-full h-screen bg-black/55"
              onClick={() => setIsSearchOpen(false)}
            />
            <div className="px-default py-3 bg-secondary relative z-10">
              <SearchBar setIsSearchOpen={setIsSearchOpen} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileMenu isOpen={isMobileOpen} setIsOpen={setIsMobileOpen} />

      <MobileProfileNav />
    </>
  );
};

export default MobileBottomMenu;
