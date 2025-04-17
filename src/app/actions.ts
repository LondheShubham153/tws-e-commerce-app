"use server";

import { cookies } from 'next/headers';

export async function createCookies(token: string) {
  const url = new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000');
  
  // Log cookie creation
  console.log('Creating cookie with domain:', url.hostname);
  
  cookies().set({
    name: "token",
    value: token,
    httpOnly: false, // Allow client-side access
    secure: false, // Set to false for HTTP on EC2
    sameSite: "lax",
    path: "/",
    domain: url.hostname === 'localhost' ? 'localhost' : undefined, // Let browser set domain for EC2
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function removeCookies() {
  cookies().delete({
    name: "token",
    path: "/",
  });
}

export async function getCookies(name: string) {
  const cookieStore = cookies();
  const cookie = await cookieStore.get(name);
  return cookie;
}

export async function authenticated() {
  const token = await getCookies("token");
  return !!token;
}
