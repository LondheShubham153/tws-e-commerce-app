"use client";

import categories from "@/data/categories.json";
import { toggleFilterOpen } from "@/lib/features/sidebar/sidebarSlice";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { useDispatch } from "react-redux";

type CategoriesType = {
  name: string;
  search_link: string;
  img?: string;
  subcategories?: {
    name: string;
    search_link: string;
  }[];
}[];

const FilterByMobileCategories = () => {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState("all");
  const dispatch = useDispatch();

  const handleActiveCategory = (category: string) => {
    setActiveCategory(category !== activeCategory ? category : "");
  };

  const _categories: CategoriesType =
    Object.entries(categories.categories).find((c) =>
      pathname.includes(c[0])
    )?.[1] || [];

  return (
    <ul className="mt-5">
      {_categories.map((category) => (
        <li key={category.name}>
          <Link
            href={category.search_link}
            className={`${
              pathname === category.search_link ? "text-primary" : ""
            } flex justify-between items-center hover:bg-accent py-2 px-3`}
            onClick={() => {
              handleActiveCategory(category.name);
              if (category?.subcategories) return;
              dispatch(toggleFilterOpen());
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
            {category?.subcategories && (
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
          {category?.subcategories && (
            <ul
              className={`${
                category.name === activeCategory ||
                category.search_link === pathname
                  ? "max-h-screen"
                  : "max-h-0"
              } pl-5 overflow-hidden transition-all duration-300 ease-in-out`}
            >
              {category?.subcategories?.map((sub) => (
                <li key={sub.name} onClick={() => dispatch(toggleFilterOpen())}>
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
  );
};

export default FilterByMobileCategories;
