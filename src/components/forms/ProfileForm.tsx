"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { useAppSelector } from "@/lib/hooks";
import Image from "next/image";
import { IoMdCloudUpload } from "react-icons/io";
import { useEffect, useState } from "react";
import { Variants, motion, AnimatePresence } from "framer-motion";

const ContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      when: "afterChildren",
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      stiffness: 90,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
  },
};

const formSchema = z.object({
  avatar: z.string(),
  name: z
    .string()
    .min(2, "Name must contain at least 2 character(s)")
    .max(20, "Name must contain at most 20 character(s)"),
  email: z
    .string({ required_error: "Email is Required" })
    .email("Please enter your valid email address"),
  bio: z
    .string({ required_error: "bio is required" })
    .min(2, "bio is required")
    .max(100, "bio less than or equal to 300 characters"),
});

const ProfileForm = () => {
  const [uploadImgUrl, setUploadImgUrl] = useState("");
  const { currentUser } = useAppSelector((state) => state.authSlice);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatar: "/icons/avatar.png",
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      bio: "",
    },
  });

  // Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.

    console.log(values);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadImgUrl(url);
    }
    return;
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={ContainerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="profile-form"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <motion.div variants={item} className="flex justify-center">
              <label
                htmlFor="avatar"
                className="cursor-pointer relative overflow-hidden rounded-full group"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-black/65 flex justify-center items-center text-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 text-white">
                  <IoMdCloudUpload />
                </div>
                <Image
                  src={uploadImgUrl || "/icons/avatar.png"}
                  alt="avatar"
                  width={100}
                  height={100}
                  className="object-cover w-[100px] h-[100px]"
                />
              </label>
              <input
                type="file"
                name="avatar"
                id="avatar"
                className="hidden"
                title="avatar"
                onChange={handleImageUpload}
              />
            </motion.div>

            <motion.div variants={item}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        // defaultValue={currentUser?.name}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={item}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        // defaultValue={currentUser?.email}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={item}>
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your bio here."
                        id="bio"
                        maxLength={100}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileForm;
