import Logo from "@/assets/Logo";
import { toggleProfileNav } from "@/lib/features/sidebar/sidebarSlice";
import { useAppSelector } from "@/lib/hooks";
import { AnimatePresence, Variants, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { BsCartCheckFill } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";
import { HiOutlineXMark } from "react-icons/hi2";
import { IoBagCheckOutline, IoLogOut } from "react-icons/io5";
import { useDispatch } from "react-redux";
import Modal from "./Modal";
import { Button } from "./ui/button";
import { removeCurrentUser } from "@/lib/features/auth/authSlice";

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
    x: "-100%",
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
    x: "-100%",
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

const profileLinks = [
  {
    title: "Profile",
    url: "/profile",
    icon: <CgProfile />,
  },
  {
    title: "My Orders",
    url: "/profile/orders",
    icon: <BsCartCheckFill />,
  },
  {
    title: "My Wishlists",
    url: "/profile/wishlists",
    icon: <FaHeart />,
  },
  {
    title: "Check out",
    url: "/checkout",
    icon: <IoBagCheckOutline />,
  },
];

const MobileProfileNav = () => {
  const [isConfirm, setIsConfirm] = useState(false);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isProfileNavOpen } = useAppSelector((state) => state.sidebarSlice);

  const handleLogout = () => {
    dispatch(removeCurrentUser());
    setIsConfirm(false);
  };

  return (
    <>
      <AnimatePresence>
        {isProfileNavOpen && (
          <motion.div
            className={`fixed top-0 left-0 h-screen z-50 w-full`}
            variants={ContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={`fixed top-0 left-0 w-full h-screen bg-black/60`}
              onClick={() => dispatch(toggleProfileNav())}
            />

            <motion.nav
              variants={itemVariants}
              className="sm:max-w-[300px] bg-secondary px-5 pb-7 top-0 z-20 relative overflow-auto h-full w-full"
            >
              <div className="header flex justify-between items-center py-5 border-b border-input">
                <Logo />

                <button
                  type="button"
                  className="text-xl p-1 h-6 w-6 bg-primary rounded-full flex justify-center items-center text-white"
                  onClick={() => dispatch(toggleProfileNav())}
                  title="close"
                >
                  <HiOutlineXMark />
                </button>
              </div>
              <ul onClick={() => dispatch(toggleProfileNav())} className="mt-2">
                {profileLinks.map((link) => (
                  <motion.li variants={item} key={link.title}>
                    <Link
                      href={link.url}
                      className={`${
                        pathname === link.url ? "text-primary bg-accent" : ""
                      } flex gap-3 items-center cursor-pointer w-full py-2 px-4 hover:bg-accent hover:text-primary`}
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span>{link.title}</span>
                    </Link>
                  </motion.li>
                ))}

                <motion.li variants={item}>
                  <button
                    type="button"
                    className="flex gap-3 items-center cursor-pointer w-full py-2 px-4 hover:bg-accent hover:text-primary"
                    onClick={() => setIsConfirm(!isConfirm)}
                  >
                    <span className="text-xl">
                      <IoLogOut />
                    </span>
                    <span>Logout</span>
                  </button>
                </motion.li>
              </ul>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* logout confirmation */}
      <Modal
        isOpen={isConfirm}
        setIsOpen={setIsConfirm}
        className="w-fit h-fit"
      >
        <div className="p-5 rounded-lg flex flex-col justify-center items-center text-center gap-3">
          <h2 className="text-lg">Are you sure to logout?</h2>
          <div className="flex justify-between items-center gap-4">
            <Button type="button" onClick={() => setIsConfirm(false)}>
              <span>No</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="border-primary hover:bg-primary hover:text-white"
              onClick={handleLogout}
            >
              <span>Ok</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MobileProfileNav;
