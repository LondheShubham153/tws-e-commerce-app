"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

const CheckoutSuccessPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/profile/orders">View Orders</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
