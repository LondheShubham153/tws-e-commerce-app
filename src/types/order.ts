export type OrderStatus = string;

export type OrderItem = {
  _id?: string;
  product: {
    _id: string;
    title: string;
    price: number;
    image: string;
    images?: string[];
    name?: string;
  };
  quantity: number;
  price: number;
};

export type Order = {
  _id: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
};
