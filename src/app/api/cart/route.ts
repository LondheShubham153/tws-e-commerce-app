import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Cart from '@/lib/models/cart';
import Product from '@/lib/models/product';
import { requireAuth } from '@/lib/auth/utils';

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    const cart = await Cart.findOne({ user: auth.userId });
    
    if (!cart) {
      console.log('No cart found for user:', auth.userId);
      return NextResponse.json({ items: [], total: 0 });
    }

    // Populate product details
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await Product.findOne({ originalId: item.product });
        const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
        return {
          ...itemObj,
          product: product ? {
            _id: product._id,
            originalId: product.originalId,
            title: product.title,
            price: product.price,
            image: product.image
          } : null
        };
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems
    };
    
    console.log('Cart found:', populatedCart);
    return NextResponse.json(populatedCart);
  } catch (error: any) {
    console.error('Cart error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

// Add/Update cart item
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    const body = await request.json();
    const { productId, quantity, price } = body;

    console.log('Adding to cart:', { productId, quantity, price });

    // Verify product exists
    const product = await Product.findOne({ originalId: productId });
    if (!product) {
      console.log('Product not found:', productId);
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log('Found product:', product);

    // Find or create cart
    let cart = await Cart.findOne({ user: auth.userId });
    if (!cart) {
      console.log('Creating new cart for user:', auth.userId);
      cart = new Cart({
        user: auth.userId,
        items: [],
        total: 0
      });
    }

    // Create cart item
    const cartItem = {
      product: product.originalId,
      quantity,
      price
    };

    console.log('Cart item:', cartItem);

    // Find item in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product === product.originalId
    );

    if (existingItemIndex > -1) {
      console.log('Updating existing item at index:', existingItemIndex);
      // Update existing item
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].price = price;
    } else {
      console.log('Adding new item to cart');
      // Add new item
      cart.items.push(cartItem);
    }

    // Update total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    console.log('Cart before save:', cart);

    // Save cart
    await cart.save();

    console.log('Cart saved successfully');

    // Populate product details for response
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await Product.findOne({ originalId: item.product });
        const itemObj = typeof item.toObject === 'function' ? item.toObject() : item;
        return {
          ...itemObj,
          product: product ? {
            _id: product._id,
            originalId: product.originalId,
            title: product.title,
            price: product.price,
            image: product.image
          } : null
        };
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems
    };

    console.log('Populated cart:', populatedCart);

    return NextResponse.json(populatedCart);
  } catch (error: any) {
    console.error('Cart error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

// Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    console.log('Clearing cart for user:', auth.userId);
    await Cart.findOneAndDelete({ user: auth.userId });
    
    console.log('Cart cleared successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cart error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
