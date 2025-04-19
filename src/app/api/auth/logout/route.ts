import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Clear the token cookie
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}
