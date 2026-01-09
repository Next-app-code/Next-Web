/**
 * API Client for Next-Web Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiError {
  error: string;
  details?: unknown;
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: 'An unknown error occurred',
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('next_auth_token');
}

/**
 * Set authentication token in localStorage
 */
function setAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('next_auth_token', token);
}

/**
 * Clear authentication token
 */
export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('next_auth_token');
}

/**
 * Create authenticated headers
 */
function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============================================================================
// Authentication API
// ============================================================================

export interface NonceResponse {
  nonce: string;
}

export interface VerifyRequest {
  message: string;
  signature: string;
  publicKey: string;
}

export interface VerifyResponse {
  success: boolean;
  user: {
    id: string;
    walletAddress: string;
  };
  token: string;
}

export const authAPI = {
  /**
   * Get authentication nonce
   */
  async getNonce(): Promise<NonceResponse> {
    return fetchAPI<NonceResponse>('/auth/nonce');
  },

  /**
   * Verify wallet signature and authenticate
   */
  async verify(data: VerifyRequest): Promise<VerifyResponse> {
    const response = await fetchAPI<VerifyResponse>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Store the token
    setAuthToken(response.token);
    
    return response;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!getAuthToken();
  },

  /**
   * Logout (clear token)
   */
  logout() {
    clearAuthToken();
  },
};

// ============================================================================
// Workspace API
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  nodes: unknown[];
  edges: unknown[];
  rpcEndpoint: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceListItem {
  id: string;
  name: string;
  description?: string;
  rpcEndpoint: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
}

export interface WorkspacesResponse {
  workspaces: WorkspaceListItem[];
  total: number;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  nodes?: unknown[];
  edges?: unknown[];
  rpcEndpoint?: string;
  isPublic?: boolean;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
  nodes?: unknown[];
  edges?: unknown[];
  rpcEndpoint?: string;
  isPublic?: boolean;
}

export const workspaceAPI = {
  /**
   * Get all user workspaces
   */
  async list(): Promise<WorkspacesResponse> {
    return fetchAPI<WorkspacesResponse>('/workspaces', {
      headers: authHeaders(),
    });
  },

  /**
   * Get a specific workspace
   */
  async get(id: string): Promise<Workspace> {
    return fetchAPI<Workspace>(`/workspaces/${id}`, {
      headers: authHeaders(),
    });
  },

  /**
   * Create a new workspace
   */
  async create(data: CreateWorkspaceRequest): Promise<Workspace> {
    return fetchAPI<Workspace>('/workspaces', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a workspace
   */
  async update(id: string, data: UpdateWorkspaceRequest): Promise<Workspace> {
    return fetchAPI<Workspace>(`/workspaces/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a workspace
   */
  async delete(id: string): Promise<void> {
    await fetchAPI<void>(`/workspaces/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
  },

  /**
   * Export workspace as JSON file
   */
  async export(id: string): Promise<Blob> {
    const url = `${API_BASE_URL}/workspaces/${id}/export`;
    const response = await fetch(url, {
      headers: authHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to export workspace');
    }

    return response.blob();
  },

  /**
   * Import workspace from JSON
   */
  async import(data: {
    name: string;
    description?: string;
    nodes: unknown[];
    edges: unknown[];
    rpcEndpoint?: string;
  }): Promise<{ success: boolean; workspace: Workspace; message: string }> {
    return fetchAPI('/workspaces/import', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
  },
};






