import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse } from '@/lib/middleware';

/**
 * GET /api/workspaces
 * Get all workspaces for authenticated user
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);

  if (!auth.authenticated || !auth.userId) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      where: { userId: auth.userId },
      select: {
        id: true,
        name: true,
        description: true,
        rpcEndpoint: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        // Don't send full nodes/edges in list view
        _count: {
          select: {
            nodes: true,
            edges: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform the response to include node/edge counts
    const transformedWorkspaces = workspaces.map((ws) => {
      const nodes = ws._count?.nodes || (Array.isArray((ws as any).nodes) ? (ws as any).nodes.length : 0);
      const edges = ws._count?.edges || (Array.isArray((ws as any).edges) ? (ws as any).edges.length : 0);
      
      return {
        ...ws,
        nodeCount: nodes,
        edgeCount: edges,
      };
    });

    return NextResponse.json({
      workspaces: transformedWorkspaces,
      total: workspaces.length,
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces
 * Create a new workspace
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);

  if (!auth.authenticated || !auth.userId) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const { name, description, nodes, edges, rpcEndpoint, isPublic } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Workspace name is required' },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        nodes: nodes || [],
        edges: edges || [],
        rpcEndpoint: rpcEndpoint || '',
        isPublic: isPublic || false,
        userId: auth.userId,
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}

