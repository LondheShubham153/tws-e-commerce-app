import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/product';
import { requireAuth } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const query: any = {};
    
    // Search by title or description
    if (searchParams.has('search')) {
      const searchRegex = new RegExp(searchParams.get('search') as string, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Filter by shop category
    if (searchParams.has('shop_category')) {
      query.shop_category = searchParams.get('shop_category');
    }
    
    // Filter by categories
    if (searchParams.has('categories')) {
      const categories = searchParams.get('categories')?.split(',') || [];
      query.categories = { $in: categories };
    }

    // Filter by price range
    if (searchParams.has('minPrice') || searchParams.has('maxPrice')) {
      query.price = {};
      if (searchParams.has('minPrice')) {
        query.price.$gte = parseFloat(searchParams.get('minPrice') as string);
      }
      if (searchParams.has('maxPrice')) {
        query.price.$lte = parseFloat(searchParams.get('maxPrice') as string);
      }
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Sorting
    let sort: any = { createdAt: -1 };
    if (searchParams.has('sort')) {
      const [field, order] = (searchParams.get('sort') as string).split(':');
      sort = { [field]: order === 'desc' ? -1 : 1 };
    }

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const product = await Product.create(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}
