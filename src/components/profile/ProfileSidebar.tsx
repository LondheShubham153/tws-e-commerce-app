"use client";

import { removeCookies } from "@/app/actions";
import { setAuthenticated } from "@/lib/features/auth/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Modal from "../Modal";
import { Button } from "../ui/button";

const links = [
  {
    title: "Profile",
    url: "/profile",
  },
  {
    title: "Change Password",
    url: "/profile/change-password",
  },
  {
    title: "My Orders",
    url: "/profile/orders",
  },
  {
    title: "My Wishlists",
    url: "/profile/wishlists",
  },
];

const ProfileSidebar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  const [isConfirm, setIsConfirm] = useState(false);

  const handleLogout = async () => {
    await removeCookies();
    dispatch(setAuthenticated(false));
    setIsConfirm(false);
    router.push("/");
  };

  return (
    <>
      <div className="p-5">
        <AnimatePresence>
          <ul>
            {links.map((link) => (
              <li key={link.url} className="relative">
                <Link
                  href={link.url}
                  className={`${
                    pathname === link.url ? "text-primary" : ""
                  } py-2 px-4 hover:bg-accent block transition-colors duration-300`}
                >
                  {link.title}
                </Link>
                {pathname === link.url && (
                  <motion.div
                    layout
                    layoutId="slideline"
                    transition={{ type: "spring" }}
                    className="absolute top-0 left-0 w-1 h-full bg-primary rounded-lg"
                  />
                )}
              </li>
            ))}

            <li className="border-t">
              <button
                type="button"
                className="py-2 px-4 hover:bg-accent block transition-colors duration-300 w-full text-left"
                onClick={() => setIsConfirm(!isConfirm)}
              >
                Logout
              </button>
            </li>
          </ul>
        </AnimatePresence>
      </div>

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

export default ProfileSidebar;
