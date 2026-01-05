import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { CustomNode, CustomEdge, Workspace, NodeCategory } from '@/types/nodes';
import { workspaceAPI, authAPI } from '@/lib/api';

interface WorkspaceState {
  // Current workspace
  workspaceId: string;
  workspaceName: string;
  nodes: CustomNode[];
  edges: CustomEdge[];
  rpcEndpoint: string;
  
  // Saved workspaces
  savedWorkspaces: Workspace[];
  
  // UI State
  selectedNodeId: string | null;
  isPropertiesPanelOpen: boolean;
  isSidebarCollapsed: boolean;
  searchQuery: string;
  activeCategory: NodeCategory | 'all';
  
  // Execution state
  isExecuting: boolean;
  executingNodeId: string | null;
  executionResults: Map<string, unknown>;
  
  // Actions
  setNodes: (nodes: CustomNode[]) => void;
  setEdges: (edges: CustomEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addNode: (node: CustomNode) => void;
  updateNode: (nodeId: string, data: Partial<CustomNode['data']>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  selectNode: (nodeId: string | null) => void;
  setRpcEndpoint: (endpoint: string) => void;
  
  // Workspace management
  createWorkspace: (name: string) => Promise<void>;
  saveWorkspace: () => Promise<void>;
  loadWorkspace: (workspaceId: string) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  loadAllWorkspaces: () => Promise<void>;
  renameWorkspace: (name: string) => void;
  exportWorkspace: () => Promise<void>;
  importWorkspace: (json: string) => Promise<boolean>;
  
  // UI actions
  togglePropertiesPanel: () => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: NodeCategory | 'all') => void;
  
  // Execution
  startExecution: () => void;
  stopExecution: () => void;
  setExecutingNode: (nodeId: string | null) => void;
  setNodeResult: (nodeId: string, result: unknown) => void;
  clearResults: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      // Initial state
      workspaceId: uuidv4(),
      workspaceName: 'Untitled Workspace',
      nodes: [],
      edges: [],
      rpcEndpoint: '',
      savedWorkspaces: [],
      selectedNodeId: null,
      isPropertiesPanelOpen: true,
      isSidebarCollapsed: false,
      searchQuery: '',
      activeCategory: 'all',
      isExecuting: false,
      executingNodeId: null,
      executionResults: new Map(),

      // Node operations
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      
      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as CustomNode[],
        });
      },
      
      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },
      
      onConnect: (connection) => {
        set({
          edges: addEdge(
            {
              ...connection,
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#4ecdc4', strokeWidth: 2 },
            },
            get().edges
          ),
        });
      },

      addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
      },

      updateNode: (nodeId, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
        });
      },

      deleteNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
          selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
        });
      },

      duplicateNode: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node) {
          const newNode: CustomNode = {
            ...node,
            id: uuidv4(),
            position: {
              x: node.position.x + 50,
              y: node.position.y + 50,
            },
            selected: false,
          };
          set({ nodes: [...get().nodes, newNode] });
        }
      },

      selectNode: (nodeId) => {
        set({ 
          selectedNodeId: nodeId,
          isPropertiesPanelOpen: nodeId !== null ? true : get().isPropertiesPanelOpen,
        });
      },

      setRpcEndpoint: (endpoint) => set({ rpcEndpoint: endpoint }),

      // Workspace management
      createWorkspace: async (name) => {
        if (!authAPI.isAuthenticated()) {
          // Fallback to local-only mode
          const newWorkspace: Workspace = {
            id: uuidv4(),
            name,
            nodes: [],
            edges: [],
            rpcEndpoint: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({
            workspaceId: newWorkspace.id,
            workspaceName: name,
            nodes: [],
            edges: [],
            rpcEndpoint: '',
            selectedNodeId: null,
          });
          return;
        }

        try {
          const workspace = await workspaceAPI.create({
            name,
            nodes: [],
            edges: [],
            rpcEndpoint: '',
          });
          
          set({
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            nodes: workspace.nodes as CustomNode[],
            edges: workspace.edges as CustomEdge[],
            rpcEndpoint: workspace.rpcEndpoint,
            selectedNodeId: null,
          });

          // Reload workspace list
          await get().loadAllWorkspaces();
        } catch (error) {
          console.error('Failed to create workspace:', error);
          throw error;
        }
      },

      saveWorkspace: async () => {
        const state = get();

        if (!authAPI.isAuthenticated()) {
          // Fallback to localStorage
          const workspace: Workspace = {
            id: state.workspaceId,
            name: state.workspaceName,
            nodes: state.nodes,
            edges: state.edges,
            rpcEndpoint: state.rpcEndpoint,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const existingIndex = state.savedWorkspaces.findIndex(
            (w) => w.id === workspace.id
          );
          
          if (existingIndex >= 0) {
            const updated = [...state.savedWorkspaces];
            updated[existingIndex] = workspace;
            set({ savedWorkspaces: updated });
          } else {
            set({ savedWorkspaces: [...state.savedWorkspaces, workspace] });
          }
          return;
        }

        try {
          // Check if workspace exists in backend
          const existing = state.savedWorkspaces.find((w) => w.id === state.workspaceId);
          
          if (existing) {
            // Update existing workspace
            await workspaceAPI.update(state.workspaceId, {
              name: state.workspaceName,
              nodes: state.nodes,
              edges: state.edges,
              rpcEndpoint: state.rpcEndpoint,
            });
          } else {
            // Create new workspace
            await workspaceAPI.create({
              name: state.workspaceName,
              nodes: state.nodes,
              edges: state.edges,
              rpcEndpoint: state.rpcEndpoint,
            });
          }

          // Reload workspace list
          await get().loadAllWorkspaces();
        } catch (error) {
          console.error('Failed to save workspace:', error);
          throw error;
        }
      },

      loadWorkspace: async (workspaceId) => {
        if (!authAPI.isAuthenticated()) {
          // Fallback to localStorage
          const workspace = get().savedWorkspaces.find((w) => w.id === workspaceId);
          if (workspace) {
            set({
              workspaceId: workspace.id,
              workspaceName: workspace.name,
              nodes: workspace.nodes,
              edges: workspace.edges,
              rpcEndpoint: workspace.rpcEndpoint,
              selectedNodeId: null,
            });
          }
          return;
        }

        try {
          const workspace = await workspaceAPI.get(workspaceId);
          set({
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            nodes: workspace.nodes as CustomNode[],
            edges: workspace.edges as CustomEdge[],
            rpcEndpoint: workspace.rpcEndpoint,
            selectedNodeId: null,
          });
        } catch (error) {
          console.error('Failed to load workspace:', error);
          throw error;
        }
      },

      loadAllWorkspaces: async () => {
        if (!authAPI.isAuthenticated()) {
          return;
        }

        try {
          const response = await workspaceAPI.list();
          const workspaces: Workspace[] = response.workspaces.map((w) => ({
            id: w.id,
            name: w.name,
            description: w.description,
            nodes: [],
            edges: [],
            rpcEndpoint: w.rpcEndpoint,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt,
          }));
          
          set({ savedWorkspaces: workspaces });
        } catch (error) {
          console.error('Failed to load workspaces:', error);
        }
      },

      deleteWorkspace: async (workspaceId) => {
        if (!authAPI.isAuthenticated()) {
          // Fallback to localStorage
          set({
            savedWorkspaces: get().savedWorkspaces.filter((w) => w.id !== workspaceId),
          });
          return;
        }

        try {
          await workspaceAPI.delete(workspaceId);
          await get().loadAllWorkspaces();
        } catch (error) {
          console.error('Failed to delete workspace:', error);
          throw error;
        }
      },

      renameWorkspace: (name) => set({ workspaceName: name }),

      exportWorkspace: async () => {
        const state = get();
        
        // Always export current state (not from server)
        // This allows exporting unsaved workspaces
        const workspace: Workspace = {
          id: state.workspaceId,
          name: state.workspaceName,
          nodes: state.nodes,
          edges: state.edges,
          rpcEndpoint: state.rpcEndpoint,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        try {
          const json = JSON.stringify(workspace, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${state.workspaceName.replace(/\s+/g, '_')}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to export workspace:', error);
          throw error;
        }
      },

      importWorkspace: async (json) => {
        try {
          const workspace = JSON.parse(json) as Workspace;
          if (!workspace.nodes || !workspace.edges) {
            return false;
          }

          if (!authAPI.isAuthenticated()) {
            // Fallback to local import
            set({
              workspaceId: uuidv4(),
              workspaceName: workspace.name || 'Imported Workspace',
              nodes: workspace.nodes,
              edges: workspace.edges,
              rpcEndpoint: workspace.rpcEndpoint || '',
              selectedNodeId: null,
            });
            return true;
          }

          const imported = await workspaceAPI.import({
            name: workspace.name,
            description: workspace.description,
            nodes: workspace.nodes,
            edges: workspace.edges,
            rpcEndpoint: workspace.rpcEndpoint,
          });

          set({
            workspaceId: imported.workspace.id,
            workspaceName: imported.workspace.name,
            nodes: imported.workspace.nodes as CustomNode[],
            edges: imported.workspace.edges as CustomEdge[],
            rpcEndpoint: imported.workspace.rpcEndpoint,
            selectedNodeId: null,
          });

          await get().loadAllWorkspaces();
          return true;
        } catch (error) {
          console.error('Failed to import workspace:', error);
          return false;
        }
      },

      // UI actions
      togglePropertiesPanel: () => {
        set({ isPropertiesPanelOpen: !get().isPropertiesPanelOpen });
      },

      toggleSidebar: () => {
        set({ isSidebarCollapsed: !get().isSidebarCollapsed });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      setActiveCategory: (category) => set({ activeCategory: category }),

      // Execution
      startExecution: () => {
        set({ isExecuting: true, executionResults: new Map() });
      },

      stopExecution: () => {
        set({ isExecuting: false, executingNodeId: null });
      },

      setExecutingNode: (nodeId) => {
        set({ executingNodeId: nodeId });
        if (nodeId) {
          get().updateNode(nodeId, { isExecuting: true });
        }
      },

      setNodeResult: (nodeId, result) => {
        const results = new Map(get().executionResults);
        results.set(nodeId, result);
        set({ executionResults: results });
        get().updateNode(nodeId, { isExecuting: false, result });
      },

      clearResults: () => {
        set({ executionResults: new Map() });
        get().nodes.forEach((node) => {
          get().updateNode(node.id, { 
            isExecuting: false, 
            result: undefined, 
            hasError: false, 
            errorMessage: undefined 
          });
        });
      },
    }),
    {
      name: 'next-workspace-storage',
      partialize: (state) => ({
        savedWorkspaces: state.savedWorkspaces,
        rpcEndpoint: state.rpcEndpoint,
      }),
    }
  )
);

