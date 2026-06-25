#!/bin/bash
set -e

echo "Building contracts..."
stellar contract build

echo "Optimizing contracts..."
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/record_registry.wasm
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/access_control.wasm

echo "Deploying RecordRegistry..."
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/record_registry.wasm \
  --source deployer \
  --network testnet \
  > .contract_ids/record_registry_id.txt

echo "Deploying AccessControl..."
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/access_control.wasm \
  --source deployer \
  --network testnet \
  > .contract_ids/access_control_id.txt

RECORD_REGISTRY_ID=$(cat .contract_ids/record_registry_id.txt)
ACCESS_CONTROL_ID=$(cat .contract_ids/access_control_id.txt)
ADMIN_ADDRESS=$(stellar keys address carevault-admin)

echo "Initializing RecordRegistry..."
stellar contract invoke \
  --id $RECORD_REGISTRY_ID \
  --source carevault-admin \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS

echo "Initializing AccessControl..."
stellar contract invoke \
  --id $ACCESS_CONTROL_ID \
  --source carevault-admin \
  --network testnet \
  -- initialize \
  --admin $ADMIN_ADDRESS

echo ""
echo "✅ Deployment Complete"
echo "RecordRegistry: $RECORD_REGISTRY_ID"
echo "AccessControl: $ACCESS_CONTROL_ID"
echo ""
echo "RecordRegistry Explorer: https://stellar.expert/explorer/testnet/contract/$RECORD_REGISTRY_ID"
echo "AccessControl Explorer: https://stellar.expert/explorer/testnet/contract/$ACCESS_CONTROL_ID"
echo ""
echo "Update .env.testnet with:"
echo "VITE_RECORD_REGISTRY_CONTRACT_ID=$RECORD_REGISTRY_ID"
echo "VITE_ACCESS_CONTROL_CONTRACT_ID=$ACCESS_CONTROL_ID"
