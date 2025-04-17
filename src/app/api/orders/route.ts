import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/order';
import Cart from '@/lib/models/cart';
import Product from '@/lib/models/product';
import { requireAuth } from '@/lib/auth/utils';

// Get user's orders
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ user: auth.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Populate product details
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedItems = await Promise.all(
          order.items.map(async (item: any) => {
            const product = await Product.findOne({ originalId: item.product });
            const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
            return {
              ...itemObj,
              product: product ? {
                _id: product._id,
                title: product.title,
                price: product.price,
                image: product.image
              } : null
            };
          })
        );
        
        return {
          ...order.toObject(),
          items: populatedItems
        };
      })
    );
    
    return NextResponse.json({
      orders: populatedOrders,
      page,
      limit
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

// Create new order from cart
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    const body = await request.json();
    const { shippingAddress, billingAddress, paymentMethod, items, total } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order items' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: 'Shipping and billing addresses are required' },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }
    
    // Map shipping address to match schema
    const mappedShippingAddress = {
      fullName: shippingAddress.title,
      address: shippingAddress.streetAddress,
      city: shippingAddress.city,
      postalCode: shippingAddress.zip,
      country: shippingAddress.country
    };

    let order;
    try {
      // Create order with mapped data
      order = await Order.create({
        user: auth.userId,
        items: items.map((item: OrderItemInput) => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        shippingAddress: mappedShippingAddress,
        paymentMethod,
        status: 'pending',
        paymentStatus: 'pending'
      });

      // Clear the cart
      await Cart.findOneAndDelete({ user: auth.userId });

      return NextResponse.json({
        message: 'Order created successfully',
        order: order
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create order' },
        { status: 500 }
      );
    }
    
    // Populate product details
    const populatedItems = await Promise.all(
      order.items.map(async (item: any) => {
        const product = await Product.findOne({ originalId: item.product });
        const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
        return {
          ...itemObj,
          product: product ? {
            _id: product._id,
            title: product.title,
            price: product.price,
            image: product.image,
            originalId: product.originalId
          } : null
        };
      })
    );
    
    return NextResponse.json({
      ...order.toObject(),
      items: populatedItems
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
