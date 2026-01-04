import { NextRequest, NextResponse } from 'next/server';
import { verify as jwtVerify } from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  walletAddress?: string;
}

/**
 * Middleware to verify JWT token from Authorization header
 */
export async function verifyAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  userId?: string;
  walletAddress?: string;
  error?: string;
}> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing or invalid authorization header',
    };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwtVerify(token, JWT_SECRET) as {
      userId: string;
      walletAddress: string;
    };

    return {
      authenticated: true,
      userId: decoded.userId,
      walletAddress: decoded.walletAddress,
    };
  } catch (error) {
    return {
      authenticated: false,
      error: 'Invalid or expired token',
    };
  }
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

