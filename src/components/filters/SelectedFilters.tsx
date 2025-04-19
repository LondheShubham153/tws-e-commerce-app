"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { MdHome } from "react-icons/md";
import { Button } from "../ui/button";

const SelectedFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedFilters, setSelectedFilters] = useState<[string, string][]>(
    []
  );

  useEffect(() => {
    const keyValues = Array.from(searchParams.entries());

    setSelectedFilters(keyValues);
  }, [searchParams]);

  const handleClear = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "clear all") {
      router.push(`${pathname}`);
    } else {
      params.delete(key);
      router.push(`${pathname}/?${params.toString()}`);
    }
  };

  const splitPaths = pathname.split("/");

  return (
    <div className="max-w-[2700px] mx-auto">
      {/* pathnames */}
      <ul className="flex items-center pt-6 gap-2 flex-wrap">
        <li>
          <Link href={"/"} className="text-2xl">
            <MdHome />
          </Link>
        </li>
        {splitPaths.map((path, i) => {
          if (path === "") return;
          return (
            <li key={i}>
              <Link
                href={
                  splitPaths[i - 1] === ""
                    ? `/${path}`
                    : `/${splitPaths[i - 1]}/${path}`
                }
              >
                <span>/</span>
                <span className="pl-2 hover:underline">{path}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {selectedFilters.length > 0 && (
        <ul className="narrowScrollbar flex gap-3 items-center mt-6 pb-3 sm:hidden overflow-auto w-full">
          <AnimatePresence>
            <motion.li
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="outline"
                className="gap-2 capitalize rounded-3xl text-sm h-8 hover:text-red-600"
                onClick={() => handleClear("clear all")}
              >
                Clear All
              </Button>
            </motion.li>

            {selectedFilters.map((f, i) => (
              <motion.li
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                key={i}
              >
                <Button
                  variant="outline"
                  className="gap-2 capitalize rounded-3xl text-sm h-8"
                >
                  <span>{f[0]}:</span>
                  <span>{f[1]}</span>
                  <span
                    className="text-lg hover:text-red-600"
                    onClick={() => handleClear(f[0])}
                  >
                    <HiMiniXMark />
                  </span>
                </Button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};

export default SelectedFilters;
