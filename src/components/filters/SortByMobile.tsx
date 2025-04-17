"use client";

import { toggleFilterOpen } from "@/lib/features/sidebar/sidebarSlice";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { useDispatch } from "react-redux";

const defaultOptions = [
  {
    name: "Name (A-Z)",
    value: "title_asc",
    sortField: "title",
    order: "asc",
  },
  {
    name: "Name (Z-A)",
    value: "title_desc",
    sortField: "title",
    order: "desc",
  },
  {
    name: "Price (Low to High)",
    value: "price_asc",
    sortField: "price",
    order: "asc",
  },
  {
    name: "Price (High to Low)",
    value: "price_desc",
    sortField: "price",
    order: "desc",
  },
  {
    name: "Popularity",
    value: "popularity",
    sortField: "rating",
    order: "asc",
  },
];

const SortByMobile = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedValue, setSelectedValue] = useState("");
  const dispatch = useDispatch();

  const handleValueChange = (value: string) => {
    const splitValue = value.split("_");
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", splitValue[0]);
    params.set("order", splitValue[1]);

    router.push(`${pathname}?${params.toString()}`);
    setSelectedValue(value);
    dispatch(toggleFilterOpen());
  };

  useEffect(() => {
    const sortParam = searchParams.get("sort");
    const orderParam = searchParams.get("order");

    if (sortParam && orderParam) {
      const selectedValue = `${sortParam}_${orderParam}`;
      setSelectedValue(selectedValue);
    }
  }, [searchParams]);

  return (
    <ul className="mt-2 bg-background">
      {defaultOptions.map((opt) => (
        <li
          key={opt.value}
          className={`${
            opt.value === selectedValue
              ? "text-foreground"
              : "text-muted-foreground"
          } px-3 py-2 rounded-lg cursor-pointer flex gap-2 items-center hover:bg-accent`}
          onClick={() => handleValueChange(opt.value)}
        >
          <span
            className={`${
              opt.value === selectedValue ? "visible" : "invisible"
            } text-base`}
          >
            <FaCheck />
          </span>

          <span>{opt.name}</span>
        </li>
      ))}
    </ul>
  );
};

export default SortByMobile;
