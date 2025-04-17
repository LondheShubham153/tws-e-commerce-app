import mongoose from 'mongoose';

export interface ICartItem {
  product: string;
  quantity: number;
  price: number;
}

export interface ICart {
  user: string;
  items: ICartItem[];
  total: number;
}

const cartItemSchema = new mongoose.Schema<ICartItem>({
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

const cartSchema = new mongoose.Schema<ICart>({
  user: {
    type: String,
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total before saving
cartSchema.pre('save', async function(next) {
  this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

// Delete existing model if it exists
if (mongoose.models.Cart) {
  delete mongoose.models.Cart;
}

// Delete existing model collection
mongoose.connection.collections['carts']?.drop();

const Cart = mongoose.model<ICart>('Cart', cartSchema);
export default Cart;
