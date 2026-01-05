import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware';

/**
 * GET /api/workspaces/[id]/export
 * Export workspace as JSON
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAuth(request);

  if (!auth.authenticated || !auth.userId) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: params.id },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    // Check ownership or public access
    if (workspace.userId !== auth.userId && !workspace.isPublic) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create exportable JSON structure
    const exportData = {
      version: '1.0',
      name: workspace.name,
      description: workspace.description,
      nodes: workspace.nodes,
      edges: workspace.edges,
      rpcEndpoint: workspace.rpcEndpoint,
      exportedAt: new Date().toISOString(),
      exportedBy: auth.walletAddress,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${workspace.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting workspace:', error);
    return NextResponse.json(
      { error: 'Failed to export workspace' },
      { status: 500 }
    );
  }
}


