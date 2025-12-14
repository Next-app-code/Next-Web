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
  createWorkspace: (name: string) => void;
  saveWorkspace: () => void;
  loadWorkspace: (workspaceId: string) => void;
  deleteWorkspace: (workspaceId: string) => void;
  renameWorkspace: (name: string) => void;
  exportWorkspace: () => string;
  importWorkspace: (json: string) => boolean;
  
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
      createWorkspace: (name) => {
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
      },

      saveWorkspace: () => {
        const state = get();
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
      },

      loadWorkspace: (workspaceId) => {
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
      },

      deleteWorkspace: (workspaceId) => {
        set({
          savedWorkspaces: get().savedWorkspaces.filter((w) => w.id !== workspaceId),
        });
      },

      renameWorkspace: (name) => set({ workspaceName: name }),

      exportWorkspace: () => {
        const state = get();
        const workspace: Workspace = {
          id: state.workspaceId,
          name: state.workspaceName,
          nodes: state.nodes,
          edges: state.edges,
          rpcEndpoint: state.rpcEndpoint,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return JSON.stringify(workspace, null, 2);
      },

      importWorkspace: (json) => {
        try {
          const workspace = JSON.parse(json) as Workspace;
          if (workspace.nodes && workspace.edges) {
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
          return false;
        } catch {
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

