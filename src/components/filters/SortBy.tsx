"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SortByProps = {
  sortingOptions?: {
    name: string;
    sortField: string;
    value: string;
    order: string;
  }[];
};

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
];

const SortBy = ({ sortingOptions = defaultOptions }: SortByProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    const splitValue = value.split("_");

    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", splitValue[0]);
    params.set("order", splitValue[1]);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select onValueChange={handleValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sort By</SelectLabel>

          {sortingOptions.map((opt) => (
            <SelectItem value={opt.value} key={opt.value}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SortBy;
