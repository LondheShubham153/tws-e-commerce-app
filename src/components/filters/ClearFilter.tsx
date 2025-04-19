"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ClearFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.toString()) {
      setVisible(true);
    } else {
      setVisible(false);
    }

    return () => {};
  }, [searchParams]);

  const handleClear = () => {
    router.push(pathname);

    setVisible(false);
  };

  return (
    <>
      {visible && (
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear Filter
        </Button>
      )}
    </>
  );
};

export default ClearFilter;
