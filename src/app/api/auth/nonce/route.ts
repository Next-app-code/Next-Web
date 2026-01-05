import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from '@/lib/auth';

/**
 * GET /api/auth/nonce
 * Generate a nonce for wallet authentication
 */
export async function GET(request: NextRequest) {
  try {
    const nonce = generateNonce();
    
    return NextResponse.json({ nonce }, { status: 200 });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}


