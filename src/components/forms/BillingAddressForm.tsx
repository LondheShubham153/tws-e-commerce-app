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
import { Variants, motion } from "framer-motion";

const formSchema = z.object({
  title: z.string().min(3, 'Name must be at least 3 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  zip: z.string().min(3, 'ZIP code must be at least 3 characters'),
});

interface BillingAddressFormProps {
  onFormDataChange: (data: any) => void;
}

const BillingAddressForm = ({ onFormDataChange }: BillingAddressFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Afzal Hassan",
      phone: "+91 9499004395",
      country: "India",
      city: "Muzaffarpur",
      state: "Bihar",
      zip: "840000",
      streetAddress: "12/43 Kidd Avenue",
    },
  });

  // Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Prevent actual form submission
    console.log('Billing form values:', values);
    onFormDataChange(values);
  }

  // Update form data on change
  const onFormChange = () => {
    const values = form.getValues();
    console.log('Form changed:', values);
    onFormDataChange(values);
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "tween",
      },
    },
    exit: { opacity: 0, y: 50 },
  };

  return (
    <div className="billing-form" data-form-type="billing">
      <h1 className="text-xl font-medium mb-4">Billing Address</h1>
      <Form {...form}>
        <form className="space-y-4" onChange={onFormChange} onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit)(e);
      }}>
          <div className="flex gap-4 items-center flex-col md:flex-row w-full">
            <motion.div variants={itemVariants} className="w-full md:w-1/2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full md:w-1/2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+88017*********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          <div className="flex gap-4 items-center flex-col md:flex-row w-full">
            <motion.div variants={itemVariants} className="w-full md:w-1/2">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="w-full md:w-1/2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          <div className="flex gap-4 items-center flex-col md:flex-row w-full">
            <motion.div variants={itemVariants} className="w-full md:w-1/2">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full md:w-1/2">
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input placeholder="eg: 1400" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="eg: 2148 Straford Park"
                      id="streetAddress"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BillingAddressForm;
