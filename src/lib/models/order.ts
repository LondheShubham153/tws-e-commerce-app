import mongoose from 'mongoose';
import { ICartItem } from './cart';

export interface IOrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  user: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
}

const orderItemSchema = new mongoose.Schema<IOrderItem>({
  product: {
    type: String,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema<IOrder>({
  user: {
    type: String,
    required: true,
    ref: 'User'
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Delete existing model if it exists
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
