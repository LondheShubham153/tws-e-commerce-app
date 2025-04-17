"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import colors from "@/data/colors.json";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

type Color = {
  title: string;
  img: string;
};

const FilterByColors = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeColor, setActiveColor] = useState<undefined | Color>(undefined);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const activeParams = searchParams.get("color");

    if (activeParams) {
      setActiveColor(
        colors.find((color) => color.title.toLowerCase() === activeParams)
      );
    } else {
      setActiveColor(undefined);
    }

    return () => {};
  }, [activeColor, searchParams]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-3 items-center">
          {activeColor && (
            <Image src={activeColor.img} width={24} height={24} alt="colors" />
          )}
          {activeColor && <p>{activeColor.title}</p>}
          {!activeColor && <p>Colors</p>}
          <span className="text-base text-muted-foreground">
            <IoIosArrowDown />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Filter By Colors</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="flex gap-2 items-center flex-wrap p-3">
          {colors.map((color) => (
            <DropdownMenuItem
              title={color.title}
              key={color.title}
              className="h-6 w-6 rounded-full cursor-pointer"
              onClick={() => {
                router.push(
                  pathname +
                    "?" +
                    createQueryString("color", color.title.toLowerCase())
                );
                setActiveColor(color);
              }}
            >
              <Image src={color.img} alt={color.title} width={24} height={24} />
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterByColors;
