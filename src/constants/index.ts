// Solana Constants
export const LAMPORTS_PER_SOL = 1_000_000_000;

// Default RPC endpoints
export const RPC_ENDPOINTS = {
  mainnet: 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
} as const;

// Node Categories
export const NODE_CATEGORIES = [
  'rpc',
  'wallet',
  'transaction',
  'account',
  'token',
  'math',
  'logic',
  'utility',
  'input',
  'output',
] as const;

// Data Types
export const DATA_TYPES = [
  'any',
  'string',
  'number',
  'boolean',
  'publickey',
  'keypair',
  'transaction',
  'instruction',
  'connection',
  'account',
  'tokenAccount',
  'array',
  'object',
] as const;

// UI Constants
export const SIDEBAR_WIDTH = 256;
export const PROPERTIES_PANEL_WIDTH = 288;
export const TOOLBAR_HEIGHT = 56;

// Grid settings
export const GRID_SIZE = 16;
export const SNAP_GRID: [number, number] = [GRID_SIZE, GRID_SIZE];

// Animation durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  workspaces: 'next-workspaces',
  preferences: 'next-preferences',
  recentRpc: 'next-recent-rpc',
} as const;


