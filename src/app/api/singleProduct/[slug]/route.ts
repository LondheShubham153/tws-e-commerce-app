import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/product';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect();
    
    const { slug } = params;
    
    // First try to find by originalId (which is used as slug)
    let product = await Product.findOne({ originalId: slug });
    
    // If not found by originalId, try by _id
    if (!product) {
      // Only try to find by _id if the slug looks like a MongoDB ObjectId
      if (/^[0-9a-fA-F]{24}$/.test(slug)) {
        product = await Product.findById(slug);
      }
    }
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching single product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
