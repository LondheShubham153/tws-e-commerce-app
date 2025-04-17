import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/types/order";
import Image from "next/image";
import Link from "next/link";

type OrderTableProps = {
  items: Order['items'];
};

export function OrderTable({ items }: OrderTableProps) {
  return (
    <Table className="mt-5 table-auto">
      {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
      <TableHeader className="bg-accent w-full">
        <TableRow className="w-full">
          <TableHead>Item</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.product._id}>
            <TableCell className="font-medium">
              <div className="flex gap-3">
                <Image
                  src={item.product.image}
                  width={40}
                  height={40}
                  alt={item.product.title}
                  className="rounded-lg"
                />
                <div>
                  <Link
                    href={`/products/${item.product._id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-xs text-primary mt-1">
                    <span>${item.price.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-center">{item.quantity}</TableCell>
            <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell></TableCell>
          <TableCell className="text-right">${items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
