import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/utils";
import User from "@/lib/models/user";
import dbConnect from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    console.log('Checking authentication status');
    const auth = await isAuthenticated(request);
    
    if (!auth || !auth.userId) {
      console.log('No valid authentication found');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Connect to database and get user details
    await dbConnect();
    const user = await User.findById(auth.userId).select('-password');
    
    if (!user) {
      console.log('User not found:', auth.userId);
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log('User authenticated:', user._id);
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 401 }
    );
  }
}
