import { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-jwt-secret-key'
);

export interface JWTPayload {
  userId: string;
  role: string;
  [key: string]: string;
}

export const generateToken = async (payload: JWTPayload): Promise<string> => {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  if (!token || token === 'undefined' || token === '[object Object]') {
    console.log('Invalid token format:', token);
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('Token verified successfully:', payload);
    
    // Verify the token has the required fields
    if (!payload.userId || !payload.role) {
      console.error('Token missing required fields:', payload);
      return null;
    }

    return {
      userId: payload.userId as string,
      role: payload.role as string
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

export const getTokenFromRequest = (request: NextRequest): string | null => {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('Found token in Authorization header');
      if (token && token !== 'undefined' && token !== '[object Object]') {
        return token;
      }
    }

    // Try to get token from cookie
    const token = request.cookies.get('token')?.value;
    if (token) {
      console.log('Found token in cookie');
      if (token !== 'undefined' && token !== '[object Object]') {
        return token;
      }
    }

    console.log('No valid token found in request');
    return null;
  } catch (error) {
    console.error('Error getting token from request:', error);
    return null;
  }
};

export const isAuthenticated = async (request: NextRequest) => {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch (error) {
    console.error('Authentication check failed:', error);
    return null;
  }
};

export const requireAuth = async (request: NextRequest) => {
  const auth = await isAuthenticated(request);
  if (!auth) {
    throw new Error('Authentication required');
  }
  return auth;
};

export const requireRole = async (request: NextRequest, roles: string[]) => {
  const auth = await requireAuth(request);
  if (!roles.includes(auth.role)) {
    throw new Error('Insufficient permissions');
  }
  return auth;
};
