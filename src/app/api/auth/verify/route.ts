import { NextRequest, NextResponse } from 'next/server';
import { verifySignature } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sign as jwtSign } from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-DO-NOT-USE-IN-PRODUCTION';

if (!process.env.NEXTAUTH_SECRET) {
  console.warn('WARNING: NEXTAUTH_SECRET is not set. Using fallback secret.');
}

/**
 * POST /api/auth/verify
 * Verify wallet signature and create/update user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature, publicKey } = body;

    if (!message || !signature || !publicKey) {
      return NextResponse.json(
        { error: 'Missing required fields: message, signature, publicKey' },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = verifySignature(message, signature, publicKey);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Check if nonce is fresh (within 5 minutes)
    const nonceMatch = message.match(/Nonce: (\d+)-/);
    if (nonceMatch) {
      const nonceTimestamp = parseInt(nonceMatch[1]);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (now - nonceTimestamp > fiveMinutes) {
        return NextResponse.json(
          { error: 'Nonce expired' },
          { status: 401 }
        );
      }
    }

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { walletAddress: publicKey },
      update: { updatedAt: new Date() },
      create: { walletAddress: publicKey },
    });

    // Generate JWT token
    const token = jwtSign(
      {
        userId: user.id,
        walletAddress: user.walletAddress,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

