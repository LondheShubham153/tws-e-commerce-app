"use client";

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
import { setAuthenticated, setCurrentUser } from "@/lib/features/auth/authSlice";
import fetchData from "@/lib/fetchDataFromApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { LuLoader } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { useToast } from "../ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormProps = {
  setIsOpen?: Dispatch<SetStateAction<boolean>>;
};

const SignupForm = ({ setIsOpen }: SignupFormProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      console.log('Submitting registration form:', values);
      const res = await fetchData.post("/auth/register", values);
      console.log('Registration response:', res.data);

      if (res.data.token) {
        // First set the cookie
        await createCookies(res.data.token);
        
        // Then update the auth state
        dispatch(setAuthenticated(true));
        dispatch(setCurrentUser(res.data.user));

        toast({
          title: "Success",
          description: "You have successfully registered",
          variant: "success",
        });

        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsLoading(false);
        setIsOpen && setIsOpen(false);
        router.push("/");
      }
    } catch (error: any) {
      console.error('Registration error:', error?.response?.data);
      const errorMessage = error?.response?.data?.error || "Registration failed. Please try again.";
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });

      if (errorMessage.includes("email")) {
        form.setError("email", { message: errorMessage });
      } else if (errorMessage.includes("password")) {
        form.setError("password", { message: errorMessage });
      }
      
      setIsLoading(false);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>name</FormLabel>
              <FormControl>
                <Input
                  className="h-12"
                  type="name"
                  placeholder="Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  className="h-12"
                  type="email"
                  placeholder="Email"
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
                  className="h-12"
                  type="password"
                  placeholder="Password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 h-12 gap-3"
        >
          <span>Login</span>
          {isLoading && (
            <span className="text-base animate-spin">
              <LuLoader />
            </span>
          )}
        </Button>

        <div className="flex gap-3 items-center justify-center my-3">
          <div className="flex-1 h-0.5 bg-muted"></div>
          <p className="text-muted">Or</p>
          <div className="flex-1 h-0.5 bg-muted"></div>
        </div>
        <Button
          type="button"
          className="w-full h-12 flex gap-4 bg-gray-900 border-input hover:text-white hover:bg-gray-800"
        >
          <span className="text-3xl">
            <FcGoogle />
          </span>
          <span>Signup with google</span>
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
