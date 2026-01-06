import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware';

/**
 * POST /api/workspaces/import
 * Import workspace from JSON
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);

  if (!auth.authenticated || !auth.userId) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const { name, description, nodes, edges, rpcEndpoint } = body;

    // Validate required fields
    if (!name || !Array.isArray(nodes) || !Array.isArray(edges)) {
      return NextResponse.json(
        { error: 'Invalid workspace format. Required: name, nodes (array), edges (array)' },
        { status: 400 }
      );
    }

    // Create new workspace from imported data
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name} (Imported)`,
        description: description || null,
        nodes,
        edges,
        rpcEndpoint: rpcEndpoint || '',
        isPublic: false,
        userId: auth.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        workspace,
        message: 'Workspace imported successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error importing workspace:', error);
    return NextResponse.json(
      { error: 'Failed to import workspace' },
      { status: 500 }
    );
  }
}




