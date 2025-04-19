"use client";

import categories from "@/data/categories.json";
import { AnimatePresence, Variants, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { RiMenuFoldLine } from "react-icons/ri";
import { Button } from "../ui/button";

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

type SidebarTwoProps = {
  isMobile?: boolean;
};

type CategoriesType = {
  name: string;
  search_link: string;
  img?: string;
  subcategories?: {
    name: string;
    search_link: string;
  }[];
}[];

const SidebarTwo = ({ isMobile = false }: SidebarTwoProps) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const _categories: CategoriesType =
    Object.entries(categories.categories).find((c) =>
      pathname.includes(c[0])
    )?.[1] || [];

  return (
    <>
      {/* for mobile */}
      {isMobile && (
        <>
          <div className="btn lg:hidden" onClick={() => setOpen(!open)}>
            <Button type="button" variant="outline" className="gap-2">
              <span className="text-2xl">
                <RiMenuFoldLine />
              </span>
              <span>Categories</span>
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                className={`fixed top-0 left-0 h-screen z-50 w-full`}
                variants={ContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div
                  className={`fixed top-0 left-0 w-full h-screen z-10 bg-black/60`}
                  onClick={() => setOpen(false)}
                />

                <motion.div
                  variants={itemVariants}
                  className={`max-w-[300px] bg-secondary px-5 py-7 top-0 z-20 relative overflow-auto h-full w-full`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-2xl font-semibold">Categories</h2>
                    <Button
                      type="button"
                      className="rounded-full h-10 w-10 p-0 text-xl hover:border-primary hover:text-primary"
                      variant={"outline"}
                      onClick={() => setOpen(false)}
                    >
                      <HiMiniXMark />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {_categories.map((c) => (
                      <motion.div variants={item} key={c.name}>
                        <Link
                          href={c.search_link}
                          className={`${
                            pathname === c.search_link
                              ? "border-primary"
                              : "border-accent"
                          } flex flex-col items-center gap-2 bg-accent p-3 rounded-lg border w-full text-center`}
                          onClick={() => setOpen(false)}
                        >
                          <Image
                            src={c?.img || ""}
                            alt={c.name}
                            width={50}
                            height={50}
                          />
                          <p>{c.name}</p>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* for desktop */}
      {!isMobile && (
        <>
          <div className={`sticky top-0 left-0 h-screen hidden lg:block`}>
            <aside
              className={`min-w-[280px] bg-secondary px-5 py-7 top-0 overflow-auto h-full w-full`}
            >
              <h2 className="text-2xl font-semibold mb-3">Categories</h2>
              <div className="grid grid-cols-2 gap-3">
                {_categories.map((item) => (
                  <Link
                    href={item.search_link}
                    className={`${
                      pathname === item.search_link
                        ? "border-primary"
                        : "border-accent"
                    } flex flex-col items-center gap-2 bg-accent p-3 rounded-lg hover:text-primary border`}
                    key={item.name}
                    onClick={() => setOpen(false)}
                  >
                    <Image
                      src={item?.img || ""}
                      alt={item.name}
                      width={50}
                      height={50}
                    />
                    <p>{item.name}</p>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </>
      )}
    </>
  );
};

export default SidebarTwo;
