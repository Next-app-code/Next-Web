<div align="center">

![NEXT](./navbeo.png)

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/NextWorkspace)
[![Website](https://img.shields.io/badge/Website-000000?style=for-the-badge&logo=About.me&logoColor=white)](https://app.nextlabs.work/)
[![GitHub stars](https://img.shields.io/github/stars/Next-app-code/Next-Web?style=for-the-badge&logo=github)](https://github.com/Next-app-code/Next-Web/stargazers)

Visual execution builder for Solana blockchain operations.

</div>

## Overview

Next Web is a node-based visual programming interface that allows you to build, visualize, and execute Solana blockchain operations. Connect to any Solana RPC endpoint and build complex transaction flows using a drag-and-drop interface.

## Features

- **Visual Node Editor**: Drag-and-drop interface for building workflows
- **Solana Wallet Authentication**: Sign in with your Solana wallet (Phantom, etc.)
- **Persistent Workspace Storage**: Save and manage multiple workflows in PostgreSQL database
- **Real-time Blockchain Connection**: Connect to any Solana RPC endpoint (mainnet, devnet, testnet)
- **Wallet Integration**: Full integration with Solana wallet adapters
- **Export/Import Workflows**: Share workflows as JSON files
- **User Authentication**: JWT-based authentication with wallet signature verification
- **Multi-category Node Support**:
  - RPC operations (balance, account info, blockhash)
  - Wallet operations (sign transactions, sign messages)
  - Transaction building (create, add instructions, send)
  - Token operations (SPL token balances, transfers)
  - Math operations (add, subtract, multiply, divide)
  - Logic operations (compare, AND, OR, NOT)
  - Input/Output nodes for data handling
  - Utility nodes (delay, JSON parsing)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: Tailwind CSS, React Flow (node editor)
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Solana wallet signatures
- **Blockchain**: @solana/web3.js, Solana Wallet Adapter

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database (local or cloud)
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/next_db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

3. Set up the database:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view database
npm run db:studio
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

### First Time Setup

1. **Connect Your Wallet**: Click the wallet button in the toolbar
2. **Sign Authentication Message**: Sign the message to authenticate with your Solana wallet
3. **Set RPC Endpoint**: Enter your preferred Solana RPC endpoint

### Building Workflows

1. **Drag Nodes**: Drag nodes from the sidebar onto the canvas
2. **Connect Nodes**: Connect nodes by dragging from output handles to input handles
3. **Configure Properties**: Click on a node to configure its properties in the right panel
4. **Execute**: Click "Run" to execute the workflow

### Workspace Management

- **Save Workspace**: Your workspace is automatically saved to the database
- **Create New**: Create multiple workspaces from the workspace dropdown
- **Export as JSON**: Share workflows by exporting them as JSON files
- **Import JSON**: Load shared workflows by importing JSON files
- **Private/Public**: Toggle workspace visibility

## API Endpoints

The application includes the following API endpoints:

### Authentication

- `GET /api/auth/nonce` - Generate authentication nonce
- `POST /api/auth/verify` - Verify wallet signature and create session

### Workspaces

- `GET /api/workspaces` - List all user workspaces
- `POST /api/workspaces` - Create new workspace
- `GET /api/workspaces/[id]` - Get specific workspace
- `PUT /api/workspaces/[id]` - Update workspace
- `DELETE /api/workspaces/[id]` - Delete workspace
- `GET /api/workspaces/[id]/export` - Export workspace as JSON
- `POST /api/workspaces/import` - Import workspace from JSON

## Database Schema

```prisma
model User {
  id            String      @id @default(cuid())
  walletAddress String      @unique
  workspaces    Workspace[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  description String?
  nodes       Json
  edges       Json
  rpcEndpoint String
  isPublic    Boolean  @default(false)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Deployment

### Railway Deployment

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Push to GitHub
2. Create Railway project from GitHub repo
3. Add PostgreSQL database
4. Set environment variables
5. Deploy!

## Project Structure

```
src/
  app/
    api/              - API routes
      auth/           - Authentication endpoints
      workspaces/     - Workspace CRUD endpoints
    layout.tsx        - Root layout
    page.tsx          - Main page
  components/         - React components
    nodes/            - Custom node components
  data/               - Node definitions
  hooks/              - Custom React hooks
  lib/                - Utilities
    auth.ts           - Authentication utilities
    prisma.ts         - Prisma client
    middleware.ts     - API middleware
  stores/             - Zustand state stores
  types/              - TypeScript types
prisma/
  schema.prisma       - Database schema
```

## Database Commands

```bash
# Generate Prisma Client
npm run postinstall

# Push schema changes (development)
npm run db:push

# Create and run migrations (production)
npx prisma migrate dev --name migration_name

# Deploy migrations (production)
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## License

MIT

