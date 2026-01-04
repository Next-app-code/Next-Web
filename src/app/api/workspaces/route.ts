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
        nodes: true,
        edges: true,
        rpcEndpoint: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform the response to include node/edge counts but not the full data
    const transformedWorkspaces = workspaces.map((ws) => {
      const nodes = Array.isArray(ws.nodes) ? ws.nodes : [];
      const edges = Array.isArray(ws.edges) ? ws.edges : [];
      
      return {
        id: ws.id,
        name: ws.name,
        description: ws.description,
        rpcEndpoint: ws.rpcEndpoint,
        isPublic: ws.isPublic,
        createdAt: ws.createdAt,
        updatedAt: ws.updatedAt,
        nodeCount: nodes.length,
        edgeCount: edges.length,
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

