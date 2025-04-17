import colors from "@/data/colors.json";
import { toggleFilterOpen } from "@/lib/features/sidebar/sidebarSlice";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type Color = {
  title: string;
  img: string;
};

const FilterByMobileColors = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeColor, setActiveColor] = useState<undefined | Color>(undefined);
  const dispatch = useDispatch();

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
    <div className="filterby-colors">
      {/* <h2 className="font-semibold text-xl">Filter By Colors</h2> */}
      <div className="flex gap-2 items-center flex-wrap p-3 bg-accent pt-3">
        {colors.map((color) => (
          <div
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
              dispatch(toggleFilterOpen());
            }}
          >
            <Image src={color.img} alt={color.title} width={24} height={24} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterByMobileColors;
