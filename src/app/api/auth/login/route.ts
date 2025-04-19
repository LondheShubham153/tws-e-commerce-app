import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/user";
import dbConnect from "@/lib/db";
import { generateToken } from "@/lib/auth/utils";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt for:', email);

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token with proper payload structure
    const tokenPayload = {
      userId: user._id.toString(),
      role: user.role,
    };
    console.log('Generating token with payload:', tokenPayload);
    const token = await generateToken(tokenPayload);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });

    // Set token in HTTP-only cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    console.log('Login successful for:', email);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
