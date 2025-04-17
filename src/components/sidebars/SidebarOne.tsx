"use client";

import categories from "@/data/categories.json";
import { AnimatePresence, Variants, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { RiMenuFoldLine } from "react-icons/ri";
import { Button } from "../ui/button";
import Image from "next/image";
import SearchBar from "../SearchBar";

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

type SidebarOneProps = {
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

const SidebarOne = ({ isMobile = false }: SidebarOneProps) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const handleActiveCategory = (category: string) => {
    setActiveCategory(category !== activeCategory ? category : "");
  };

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
                  className={`fixed top-0 left-0 w-full h-screen bg-black/60`}
                  onClick={() => setOpen(false)}
                />

                <motion.div
                  variants={itemVariants}
                  className={`max-w-[280px] bg-secondary px-5 py-7 top-0 z-20 relative overflow-auto h-full w-full`}
                >
                  <h2 className="text-2xl font-semibold">Categories</h2>
                  <ul className="mt-5">
                    {_categories.map((category) => (
                      <motion.li variants={item} key={category.name}>
                        <Link
                          href={category.search_link}
                          className={`${
                            category.name === activeCategory ||
                            category.search_link === pathname
                              ? "text-primary"
                              : ""
                          } flex justify-between items-center hover:bg-accent py-2 px-3`}
                          onClick={() => {
                            handleActiveCategory(category.name);
                            if (isMobile && !category.subcategories)
                              setOpen(false);
                          }}
                        >
                          <span className="flex gap-3 items-center">
                            {category.img && (
                              <Image
                                src={category.img}
                                width={30}
                                height={30}
                                alt={category.name}
                                className="rounded-full"
                              />
                            )}
                            <span>{category.name}</span>
                          </span>
                          {category.subcategories && (
                            <span>
                              <LuChevronDown
                                className={`${
                                  category.name === activeCategory ||
                                  category.search_link === pathname
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </span>
                          )}
                        </Link>

                        {/* sub categories */}
                        {category.subcategories && (
                          <ul
                            className={`${
                              category.name === activeCategory ||
                              category.search_link === pathname
                                ? "max-h-screen"
                                : "max-h-0"
                            } pl-5 overflow-hidden transition-all duration-300 ease-in-out`}
                          >
                            {category.subcategories.map((sub) => (
                              <li
                                key={sub.name}
                                onClick={() => {
                                  if (isMobile) setOpen(false);
                                }}
                              >
                                <Link
                                  href={sub.search_link}
                                  className={`${
                                    pathname === sub.search_link
                                      ? "text-primary"
                                      : "text-gray-700 dark:text-gray-300"
                                  } py-1 px-3 block hover:bg-accent hover:text-primary transition-colors`}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.li>
                    ))}
                  </ul>
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
              className={`min-w-[250px] bg-secondary px-5 py-7 top-0 overflow-auto h-full w-full`}
            >
              <h2 className="text-2xl font-semibold">Search</h2>
              <div className="my-4">
                <SearchBar className="max-w-[220px]" useSelect={false} />
              </div>
              <h2 className="text-2xl font-semibold">Categories</h2>
              <ul className="mt-5">
                {_categories.map((category) => (
                  <li key={category.search_link}>
                    <Link
                      href={category.search_link}
                      className={`${
                        category.name === activeCategory ||
                        pathname === category.search_link
                          ? "text-primary"
                          : ""
                      } flex justify-between items-center hover:bg-accent py-2 px-3`}
                      onClick={() => handleActiveCategory(category.name)}
                    >
                      <span>{category.name}</span>
                      {category.subcategories && (
                        <span>
                          <LuChevronDown
                            className={`${
                              category.name === activeCategory ||
                              pathname === category.search_link ||
                              category.subcategories.find(
                                (subcategory) =>
                                  subcategory.search_link === pathname
                              )
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </span>
                      )}
                    </Link>

                    {/* sub categories */}
                    {category.subcategories && (
                      <ul
                        className={`${
                          category.name === activeCategory ||
                          pathname === category.search_link ||
                          category.subcategories.find(
                            (subcategory) =>
                              subcategory.search_link === pathname
                          )
                            ? "max-h-screen"
                            : "max-h-0"
                        } pl-5 overflow-hidden transition-all duration-300 ease-in-out`}
                      >
                        {category.subcategories.map((sub) => (
                          <li
                            key={sub.name}
                            onClick={() => {
                              if (isMobile) setOpen(false);
                            }}
                          >
                            <Link
                              href={sub.search_link}
                              className={`${
                                pathname === sub.search_link
                                  ? "text-primary"
                                  : "text-gray-700 dark:text-gray-300"
                              } py-1 px-3 block hover:text-primary transition-colors`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </>
      )}
    </>
  );
};

export default SidebarOne;
