import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/product';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const products = await Product.find({ shop_category: 'books' })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
