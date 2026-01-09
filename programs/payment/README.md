# Next Payment Program

Token-based payment system for Solana blockchain.

## Overview

This program enables secure token-based payments with:
- SPL token transfers
- Fee mechanism (configurable basis points)
- Payment record tracking
- Refund capability
- PDA-based account management

## Building

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Add BPF target
rustup target add bpfel-unknown-unknown
```

### Build the program

```bash
cd programs/payment
cargo build-bpf
```

Or use the build script:

```bash
chmod +x build.sh
./build.sh
```

## Deploying

### Deploy to Devnet

```bash
solana config set --url devnet
solana program deploy ../../target/deploy/next_payment.so
```

### Deploy to Mainnet

```bash
solana config set --url mainnet-beta
solana program deploy ../../target/deploy/next_payment.so
```

## Program Instructions

### 1. Initialize Config

Setup payment configuration for your service.

**Accounts**:
- `[writable, signer]` Authority
- `[writable]` Config PDA
- `[]` Accepted token mint
- `[]` Fee recipient
- `[]` System program

**Data**:
- `fee_bps: u16` - Fee in basis points (100 = 1%)

### 2. Process Payment

Execute a token payment.

**Accounts**:
- `[writable, signer]` Payer
- `[writable]` Payment PDA
- `[writable]` Payer token account
- `[writable]` Recipient token account
- `[writable]` Fee token account (optional)
- `[]` Recipient
- `[]` Token mint
- `[]` Token program
- `[]` System program
- `[]` Clock sysvar

**Data**:
- `amount: u64` - Payment amount in token units
- `memo: String` - Payment description

### 3. Refund Payment

Refund a payment (authority only).

**Accounts**:
- `[writable, signer]` Authority
- `[writable]` Payment account
- `[writable]` Recipient token account
- `[writable]` Payer token account
- `[]` Token program

## PDAs

### Config PDA
```
seeds: ["config", authority_pubkey]
```

### Payment PDA
```
seeds: ["payment", payer_pubkey, recipient_pubkey]
```

## State Accounts

### PaymentConfig
- `authority: Pubkey` - Config owner
- `accepted_mint: Pubkey` - Accepted token
- `fee_bps: u16` - Fee percentage
- `fee_recipient: Pubkey` - Fee destination
- `bump: u8` - PDA bump seed

### Payment
- `recipient: Pubkey` - Payment recipient
- `mint: Pubkey` - Token mint
- `amount: u64` - Payment amount
- `payer: Pubkey` - Who paid
- `timestamp: i64` - Unix timestamp
- `status: u8` - 0=pending, 1=completed, 2=refunded
- `memo: [u8; 64]` - Payment memo

## Usage Example

See `Next-API/src/routes/payment.ts` for client-side implementation examples.

## Security Considerations

- Always verify token mint matches expected token
- Check token account ownership
- Validate sufficient balance before transfer
- Use PDAs for deterministic account addresses
- Implement proper access control for refunds

## License

MIT

