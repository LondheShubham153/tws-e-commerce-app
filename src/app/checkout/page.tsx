"use client";

import HistoryBackBtn from "@/components/HistoryBackBtn";
import OrderSummery from "@/components/checkout/OrderSummery";
import BillingAddressForm from "@/components/forms/BillingAddressForm";
import ShippingAddressForm from "@/components/forms/ShippingAddressForm";
import { AnimatePresence, Variants, motion } from "framer-motion";
import { useState } from "react";

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
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

const btns = [
  {
    title: "billing",
  },
  {
    title: "shipping",
  },
];

const CheckoutPage = () => {
  const [activeForm, setActiveForm] = useState("billing");
  const [formData, setFormData] = useState<{
    shipping: any;
    billing: any;
  }>({ shipping: null, billing: null });

  const updateFormData = (type: 'shipping' | 'billing', data: any) => {
    setFormData(prev => ({
      ...prev,
      [type]: data
    }));
    console.log(`Updated ${type} data:`, data);
  };

  return (
    <div className="checkout-page">
      <div className="container pt-7 pb-20">
        <HistoryBackBtn />
        <div className="flex gap-7 flex-col pt-7 md:flex-row">
          <AnimatePresence mode="wait">
            <div className="left w-full md:w-3/5 bg-secondary shadow-lg py-10 px-5 rounded-lg overflow-hidden h-fit">
              <h2 className="text-2xl font-bold mb-5">Checkout</h2>
              <div className="flex gap-5 mb-5">
                {btns.map((btn) => (
                  <button
                    type="button"
                    key={btn.title}
                    className={`${
                      activeForm === btn.title
                        ? "text-white"
                        : "text-foreground"
                    } px-5 py-2 bg-accent rounded-lg border capitalize relative`}
                    onClick={() => setActiveForm(btn.title)}
                  >
                    <span className="relative z-10">{btn.title}</span>
                    {activeForm === btn.title && (
                      <motion.span
                        layout
                        layoutId="active"
                        transition={{ type: "spring" }}
                        className="absolute top-0 left-0 w-full h-full bg-primary rounded-lg"
                      />
                    )}
                  </button>
                ))}
              </div>
              {activeForm === "billing" && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <BillingAddressForm onFormDataChange={(data) => updateFormData('billing', data)} />
                </motion.div>
              )}
              {activeForm === "shipping" && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <ShippingAddressForm onFormDataChange={(data) => updateFormData('shipping', data)} />
                </motion.div>
              )}
            </div>
          </AnimatePresence>
          <div className="right w-full bg-secondary shadow-lg rounded-lg py-10 px-5 md:w-2/5 h-fit">
            <OrderSummery 
              shippingData={formData.shipping}
              billingData={formData.billing}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
