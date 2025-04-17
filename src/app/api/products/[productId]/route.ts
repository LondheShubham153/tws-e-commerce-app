import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/product';
import { requireAuth } from '@/lib/auth/utils';

// Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await dbConnect();
    
    const product = await Product.findOne({ originalId: params.productId });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Create single product
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const product = await Product.create(body);
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Update product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
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
    
    const product = await Product.findOneAndUpdate(
      { originalId: params.productId },
      body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

// Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
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
    
    const product = await Product.findOneAndDelete({ originalId: params.productId });
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
