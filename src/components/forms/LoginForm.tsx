"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createCookies } from "@/app/actions";
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
import {
  User,
  setAuthenticated,
  setCurrentUser,
} from "@/lib/features/auth/authSlice";
import fetchData from "@/lib/fetchDataFromApi";
import { useAppSelector } from "@/lib/hooks";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { LuLoader } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormProps = {
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
};

export function LoginForm({ setIsOpen }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { cartItems } = useAppSelector((state) => state.cartSlice);
  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "demo@gmail.com",
      password: "test1234",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const res = await fetchData.post("/auth/login", values);
      await createCookies(res.data.token);
      dispatch(setCurrentUser(res.data.user as User));
      dispatch(setAuthenticated(true));
      form.reset();
      setIsLoading(false);
      setIsOpen && setIsOpen(false);
      
      toast({
        title: "Success",
        description: "You have successfully Logged in",
        variant: "success",
      });

      // Handle redirection based on redirect parameter
      const redirectTo = searchParams.get('redirect');
      if (redirectTo) {
        if (redirectTo === '/checkout' && cartItems.length === 0) {
          router.replace('/');
          toast({
            title: "Empty Cart",
            description: "Please add items to your cart before checking out",
            variant: "default",
          });
        } else {
          router.replace(redirectTo);
        }
      } else {
        router.replace('/');
      }
    } catch (error: any) {
      setIsLoading(false);
      toast({
        title: "Authentication failed",
        description: error.response?.data?.error || "Please try again",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <LuLoader className="animate-spin" /> Please wait...
            </span>
          ) : (
            "Login"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
        >
          <FcGoogle className="text-xl" />
          Login with Google
        </Button>
      </form>
    </Form>
  );
}
