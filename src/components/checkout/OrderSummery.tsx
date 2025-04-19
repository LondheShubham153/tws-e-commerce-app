"use client";

import { removeFromCart } from "@/lib/features/cart/cartSlice";
import { useAppSelector } from "@/lib/hooks";
import { totalPrice } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiMiniXMark } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import Skeleton from "../loader/Skeleton";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle } from "../ui/card";

const paymentMethods = [
  {
    title: "cash on delivery",
  },
];

interface OrderSummeryProps {
  shippingData: any;
  billingData: any;
}

const OrderSummery = ({ shippingData, billingData }: OrderSummeryProps) => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { cartItems } = useAppSelector((state) => state.cartSlice);
  const dispatch = useDispatch();

  const getImageSrc = (item: any) => {
    if (!item.image) return '/placeholder.jpg';
    if (Array.isArray(item.image) && item.image.length > 0) {
      return item.image[0].startsWith('/') ? item.image[0] : `/${item.image[0]}`;
    }
    if (typeof item.image === 'string') {
      return item.image.startsWith('/') ? item.image : `/${item.image}`;
    }
    return '/placeholder.jpg';
  };

  const handleSelectMethod = (title: string) => {
    setSelectedMethod(title);
  };

  const placeOrder = async () => {
    try {
      if (!selectedMethod) {
        throw new Error('Please select a payment method');
      }

      if (!shippingData || !billingData) {
        throw new Error('Please fill in both shipping and billing addresses');
      }

      console.log('Shipping address:', shippingData);
      console.log('Billing address:', billingData);

      // Validate addresses
      const validateAddress = (address: any, type: string) => {
        const missingFields = Object.entries(address)
          .filter(([_, value]) => !value)
          .map(([key]) => key);

        if (missingFields.length > 0) {
          throw new Error(`Please fill in the following ${type} fields: ${missingFields.join(', ')}`);
        }
      };

      validateAddress(shippingData, 'shipping');
      validateAddress(billingData, 'billing');

      console.log('Submitting order with data:', {
        shippingAddress: shippingData,
        billingAddress: billingData,
        paymentMethod: selectedMethod,
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.amount || 1,
          price: item.price
        })),
        total: totalPrice(cartItems) + 20
      });

      const orderData = {
        shippingAddress: shippingData,
        billingAddress: billingData,
        paymentMethod: selectedMethod,
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.amount || 1,
          price: item.price
        })),
        total: totalPrice(cartItems) + 20 // Including shipping and tax
      };

      console.log('Submitting order with data:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log('Server response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear cart and redirect on success
      cartItems.forEach(item => dispatch(removeFromCart(item._id)));
      window.location.href = '/checkout/success';

      // Clear cart and redirect to success page
      cartItems.forEach(item => dispatch(removeFromCart(item._id)));
      window.location.href = '/checkout/success';

    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(error.message || 'Failed to place order');
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? (
    <AnimatePresence>
      <div className="order-summery">
        <h2 className="text-2xl font-bold mb-5">Order Summary</h2>
        <div className="pb-4">
          {cartItems.length <= 0 && (
            <div className="text-center py-6">No prodduct select!</div>
          )}
          {cartItems.map((item) => (
            <motion.div
              layout
              key={item._id}
              className="group flex justify-between items-end py-3 hover:bg-accent px-3 rounded-lg relative"
            >
              <Button
                type="button"
                variant="outline"
                className="absolute top-1 right-2 h-7 w-7 p-0 text-base rounded-full hover:text-primary hover:border-primary hidden group-hover:flex"
                onClick={() => dispatch(removeFromCart(item._id))}
              >
                <HiMiniXMark />
              </Button>
              <div className="flex gap-3">
                <div className="relative w-[50px] h-[50px]">
                  {!imageErrors[item._id] ? (
                    <Image
                      src={getImageSrc(item)}
                      alt={item.title}
                      fill
                      sizes="50px"
                      className="object-cover rounded-md"
                      onError={() => {
                        console.error(`Failed to load image for product: ${item.title}`);
                        setImageErrors(prev => ({ ...prev, [item._id]: true }));
                      }}
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    href={`/products/${item._id}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    ${item.price} x {item.amount || 1}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${((item.price || 0) * (item.amount || 1)).toFixed(2)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {cartItems.length > 0 && (
          <div className="pb-5 pt-3">
            <h3 className="text-xl font-medium text-center">
              Select Payment Method
            </h3>
            <div className="flex gap-4 items-center mt-4">
              {paymentMethods.map((method) => (
                <Card
                  className={`${
                    method.title === selectedMethod
                      ? "text-primary border-primary"
                      : ""
                  } cursor-pointer`}
                  key={method.title}
                  onClick={() => handleSelectMethod(method.title)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">
                      Cash on Delivery
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-5 border-t pt-4">
          <div className="flex justify-between font-semibold">
            <p>Subtotal</p>
            <p>${totalPrice(cartItems)}</p>
          </div>
          <div className="flex justify-between">
            <p>Shipping</p>
            <p className="text-muted-foreground">$10</p>
          </div>
          <div className="flex justify-between">
            <p>Tax</p>
            <p className="text-muted-foreground">$10</p>
          </div>
          <div className="flex justify-between font-semibold">
            <p>Total</p>
            <p>${totalPrice(cartItems) + 10 + 10}</p>
          </div>
        </div>
        <Button
          type="button"
          disabled={cartItems.length <= 0 || selectedMethod === ""}
          className="w-full mt-5 capitalize"
          onClick={placeOrder}
        >
          Place Order
        </Button>
      </div>
    </AnimatePresence>
  ) : (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 rounded-2xl w-full max-[200px]" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg w-full" />
      ))}

      <Skeleton className="h-7 rounded-lg w-full max-[150px] mx-auto py-4" />

      {[...Array(4)].map((_, i) => (
        <div className="flex justify-between items-center" key={i}>
          <Skeleton className="h-5 rounded-lg w-16" />
          <Skeleton className="h-5 rounded-lg w-10" />
        </div>
      ))}
    </div>
  );
};

export default OrderSummery;
