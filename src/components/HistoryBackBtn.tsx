"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { IoIosArrowRoundBack } from "react-icons/io";

const HistoryBackBtn = () => {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant={"outline"}
      onClick={() => router.back()}
      className="flex gap-3 items-center"
    >
      <span className="text-2xl">
        <IoIosArrowRoundBack />
      </span>

      <span>Back</span>
    </Button>
  );
};

export default HistoryBackBtn;
