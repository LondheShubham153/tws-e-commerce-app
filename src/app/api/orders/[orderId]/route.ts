import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/order';
import { requireAuth } from '@/lib/auth/utils';

// Get single order
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    const order = await Order.findOne({
      _id: params.orderId,
      user: auth.userId
    }).populate('items.product', 'title price image');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

// Update order status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    await dbConnect();
    const body = await request.json();
    const { status } = body;
    
    const order = await Order.findByIdAndUpdate(
      params.orderId,
      { status },
      { new: true }
    ).populate('items.product', 'title price image');
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

// Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const auth = await requireAuth(request);
    await dbConnect();
    
    const order = await Order.findOne({
      _id: params.orderId,
      user: auth.userId
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot cancel order in current status' },
        { status: 400 }
      );
    }
    
    order.status = 'cancelled';
    await order.save();
    
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
