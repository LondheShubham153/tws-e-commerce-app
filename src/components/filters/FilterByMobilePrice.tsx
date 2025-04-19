import { useSearchParams, useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toggleFilterOpen } from "@/lib/features/sidebar/sidebarSlice";
import { useDispatch } from "react-redux";

type PriceOption = {
  maxPrice: string;
  minPrice: string;
};

const priceOptions = [
  {
    title: "under $25",
    minPrice: "",
    maxPrice: "25",
  },
  {
    title: "$25 to $50",
    minPrice: "25",
    maxPrice: "50",
  },
  {
    title: "$50 to $100",
    minPrice: "50",
    maxPrice: "100",
  },
  {
    title: "$100 to $200",
    minPrice: "100",
    maxPrice: "200",
  },
  {
    title: "$200 & above",
    minPrice: "200",
    maxPrice: "",
  },
];
const FilterByMobilePrice = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("");
  const [priceData, setPriceData] = useState({
    min: "",
    max: "",
  });

  const dispatch = useDispatch();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPriceData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { min, max } = priceData;
    // if (!min || !max) return;

    handleActiveParams({ maxPrice: max, minPrice: min });
  };

  const handleActiveParams = ({ maxPrice, minPrice }: PriceOption) => {
    const params = new URLSearchParams(searchParams.toString());

    minPrice ? params.set("minPrice", minPrice) : params.delete("minPrice");
    maxPrice ? params.set("maxPrice", maxPrice) : params.delete("maxPrice");

    router.push(`?${params.toString()}`);
    dispatch(toggleFilterOpen());
  };

  useEffect(() => {
    const min = searchParams.get("minPrice");
    const max = searchParams.get("maxPrice");

    if (min && max) {
      setActiveFilter(`$${min} to $${max}`);
    } else if (min && !max) {
      setActiveFilter(`$${min} & above`);
    } else if (max && !min) {
      setActiveFilter(`under $${max}`);
    } else {
      setActiveFilter("");
    }

    return () => {};
  }, [searchParams]);

  console.log(activeFilter);

  return (
    <div className="grid gap-4 pt-3">
      <div className="space-y-2">
        <ul>
          {priceOptions.map((price) => (
            <li key={price.title}>
              <div
                className={`${
                  price.title === activeFilter ? "text-primary" : ""
                } cursor-pointer block py-2 px-3 hover:bg-accent text-muted-foreground w-full h-full`}
                onClick={() => handleActiveParams(price)}
              >
                {price.title}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid items-center gap-4">
            {/* <Label htmlFor="Min">Min</Label> */}
            <Input
              id="Min"
              defaultValue={priceData.min}
              placeholder="$Min"
              className="h-8"
              name="min"
              type="number"
              min={1}
              onChange={handleChange}
            />
          </div>
          <div className="grid items-center gap-4">
            {/* <Label htmlFor="Max">Max</Label> */}
            <Input
              id="Max"
              defaultValue={priceData.max}
              placeholder="$Max"
              className="h-8"
              name="max"
              min={1}
              type="number"
              onChange={handleChange}
            />
          </div>
        </div>
        <Button
          type="submit"
          variant="outline"
          className="uppercase h-8 w-full mt-3"
        >
          Go
        </Button>
      </form>
    </div>
  );
};

export default FilterByMobilePrice;
