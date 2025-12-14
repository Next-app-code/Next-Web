# Next Web

Visual execution builder for Solana blockchain operations.

## Overview

Next Web is a node-based visual programming interface that allows you to build, visualize, and execute Solana blockchain operations. Connect to any Solana RPC endpoint and build complex transaction flows using a drag-and-drop interface.

## Features

- Visual node-based editor with drag-and-drop interface
- Real-time connection to Solana blockchain via custom RPC endpoints
- Wallet integration with Phantom and other Solana wallets
- Workspace management with save, load, and share functionality
- Export and import workflows as JSON files
- Support for multiple node categories:
  - RPC operations (balance, account info, blockhash)
  - Wallet operations (sign transactions, sign messages)
  - Transaction building (create, add instructions, send)
  - Token operations (SPL token balances, transfers)
  - Math operations (add, subtract, multiply, divide)
  - Logic operations (compare, AND, OR, NOT)
  - Input/Output nodes for data handling
  - Utility nodes (delay, JSON parsing)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

## Usage

1. Enter your Solana RPC endpoint in the toolbar
2. Connect your wallet using the wallet button
3. Drag nodes from the sidebar onto the canvas
4. Connect nodes by dragging from output handles to input handles
5. Configure node properties in the properties panel
6. Click "Run" to execute the workflow

## Workspace Management

- Create new workspaces from the workspace dropdown
- Save current workspace to preserve your work
- Export workspace as JSON to share with others
- Import JSON files to load shared workspaces

## Architecture

- Built with Next.js 14 and React 18
- React Flow for the node-based editor
- Zustand for state management
- Tailwind CSS for styling
- Solana wallet adapter for wallet integration

## Project Structure

```
src/
  app/           - Next.js app router pages
  components/    - React components
    nodes/       - Custom node components
  data/          - Node definitions and configurations
  stores/        - Zustand state stores
  types/         - TypeScript type definitions
```

## License

MIT

