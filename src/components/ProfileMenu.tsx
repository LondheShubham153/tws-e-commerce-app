"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { BsCartCheckFill } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { FaHeart } from "react-icons/fa";
import { IoBagCheckOutline, IoLogOut } from "react-icons/io5";

const profileLinks = [
  {
    title: "Profile",
    url: "/profile",
    icon: <CgProfile />,
  },
  {
    title: "My Orders",
    url: "/profile/orders",
    icon: <BsCartCheckFill />,
  },
  {
    title: "My Wishlists",
    url: "/profile/wishlists",
    icon: <FaHeart />,
  },
  {
    title: "Check out",
    url: "/checkout",
    icon: <IoBagCheckOutline />,
  },
];

type ProfileMenuProps = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export function ProfileMenu({ setIsOpen }: ProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src={"/icons/avatar.png"}
          width={35}
          height={35}
          alt="profile"
          className="rounded-full cursor-pointer"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <ul>
          {profileLinks.map((link) => (
            <li key={link.title}>
              <Link href={link.url}>
                <DropdownMenuItem className="flex gap-3 items-center cursor-pointer w-full py-2 px-4">
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.title}</span>
                </DropdownMenuItem>
              </Link>
            </li>
          ))}
          <li>
            <DropdownMenuItem
              className="flex gap-3 items-center cursor-pointer w-full py-2 px-4"
              onClick={() => setIsOpen(true)}
            >
              <span className="text-xl">
                <IoLogOut />
              </span>
              <span>Logout</span>
            </DropdownMenuItem>
          </li>
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
