#!/bin/bash

# Build the Solana program
cargo build-bpf --manifest-path=Cargo.toml --bpf-out-dir=../../target/deploy

echo "✓ Program built successfully"
echo "Program binary: ../../target/deploy/next_payment.so"

