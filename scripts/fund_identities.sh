#!/bin/bash
set -e

echo "Generating deployer identity..."
stellar keys generate deployer --network testnet

echo "Funding deployer..."
stellar keys fund deployer --network testnet

echo "Generating admin identity..."
stellar keys generate carevault-admin --network testnet

echo "Funding admin..."
stellar keys fund carevault-admin --network testnet

echo "Generating doctor identity for testing..."
stellar keys generate carevault-doctor --network testnet

echo "Funding doctor..."
stellar keys fund carevault-doctor --network testnet

echo ""
echo "✅ Identities created and funded"
echo ""
stellar keys list
echo ""

DEPLOYER_ID=$(stellar keys address deployer)
echo "Deployer balance:"
stellar account show --account-id $DEPLOYER_ID --network testnet | grep "XLM"
