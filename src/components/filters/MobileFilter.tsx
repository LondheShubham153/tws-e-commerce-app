"use client";

import { toggleFilterOpen } from "@/lib/features/sidebar/sidebarSlice";
import { useAppSelector } from "@/lib/hooks";
import layoutSettings from "@/lib/layoutSettings";
import { AnimatePresence, Variants, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { HiOutlineXMark } from "react-icons/hi2";
import { LuSettings2 } from "react-icons/lu";
import { useDispatch } from "react-redux";
import FilterByMobileCategories from "./FilterByMobileCategories";
import FilterByMobileColors from "./FilterByMobileColors";
import FilterByMobilePrice from "./FilterByMobilePrice";
import SortByMobile from "./SortByMobile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { Suspense } from "react";

type Options = {
  useColor?: boolean;
  usePrice?: boolean;
  useClear?: boolean;
  useCategory?: boolean;
  useSort?: boolean;
};

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      stiffness: 90,
    },
  },
};

const MobileFilter = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isFilterOpen } = useAppSelector((state) => state.sidebarSlice);

  let defaultOptions: Options = {
    useSort: true,
    useCategory: true,
    useClear: true,
    useColor: false,
    usePrice: false,
  };

  const _filterOptions =
    Object.entries(layoutSettings).find((f) => pathname.includes(f[0]))?.[1]
      .filterOptions || defaultOptions;

  defaultOptions = { ...defaultOptions, ..._filterOptions };

  return (
    <>
      <Button
        variant={"outline"}
        className="flex gap-1 items-center"
        onClick={() => dispatch(toggleFilterOpen())}
      >
        <span className="text-xl">
          <LuSettings2 />
        </span>
        <span>Filter</span>
      </Button>

      <Suspense>
        <AnimatePresence mode="wait">
          {isFilterOpen && (
            <motion.div
              variants={ContainerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="mobile-menu fixed top-0 left-0 w-full h-screen z-[99]"
            >
              <div
                className="fixed top-0 left-0 w-full h-full bg-black/60"
                onClick={() => dispatch(toggleFilterOpen())}
              />
              <motion.div
                variants={itemVariants}
                className="filter-options fixed top-0 left-0 w-full max-w-[300px] h-full bg-secondary z-[60] overflow-auto py-6 px-5"
              >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Filter By</h2>
                    <button
                      type="button"
                      className="text-xl p-1 h-6 w-6 bg-primary rounded-full flex justify-center items-center text-white"
                      onClick={() => dispatch(toggleFilterOpen())}
                      title="close"
                    >
                      <HiOutlineXMark />
                    </button>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {defaultOptions.useCategory && (
                      <motion.div className="motion" variants={item}>
                        <AccordionItem value="item-1">
                          <AccordionTrigger className="border border-input bg-background hover:bg-accent px-3 rounded-lg hover:no-underline hover:text-primary">
                            Categories
                          </AccordionTrigger>
                          <AccordionContent>
                            <FilterByMobileCategories />
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    )}
                    {defaultOptions.useColor && (
                      <motion.div className="motion" variants={item}>
                        <AccordionItem value="item-2">
                          <AccordionTrigger className="border border-input bg-background hover:bg-accent px-3 rounded-lg hover:no-underline hover:text-primary">
                            Colors
                          </AccordionTrigger>

                          <AccordionContent>
                            <FilterByMobileColors />
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    )}

                    {defaultOptions.usePrice && (
                      <motion.div className="motion" variants={item}>
                        <AccordionItem value="item-3">
                          <AccordionTrigger className="border border-input bg-background hover:bg-accent px-3 rounded-lg hover:no-underline hover:text-primary">
                            Price
                          </AccordionTrigger>

                          <AccordionContent>
                            <FilterByMobilePrice />
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    )}

                    {defaultOptions.useSort && (
                      <motion.div className="motion" variants={item}>
                        <AccordionItem value="item-4">
                          <AccordionTrigger className="border border-input bg-background hover:bg-accent px-3 rounded-lg hover:no-underline hover:text-primary">
                            SortBy
                          </AccordionTrigger>

                          <AccordionContent>
                            <SortByMobile />
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    )}
                  </Accordion>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
    </>
  );
};

export default MobileFilter;
