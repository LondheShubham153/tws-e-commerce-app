import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth/utils";
import User from "@/lib/models/user";
import dbConnect from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const auth = await isAuthenticated(request);
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(auth.userId).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Error fetching user data" },
      { status: 500 }
    );
  }
}
