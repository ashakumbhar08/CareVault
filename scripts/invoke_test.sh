#!/bin/bash
set -e

RECORD_REGISTRY_ID=$(cat .contract_ids/record_registry_id.txt)
ACCESS_CONTROL_ID=$(cat .contract_ids/access_control_id.txt)
DEPLOYER_ADDRESS=$(stellar keys address deployer)
DOCTOR_ADDRESS=$(stellar keys address carevault-doctor)
CURRENT_TIMESTAMP=$(date +%s)
EXPIRES_AT=$((CURRENT_TIMESTAMP + 2592000))

echo "Testing RecordRegistry contract..."
echo "Uploading test record..."

UPLOAD_TX=$(stellar contract invoke \
  --id $RECORD_REGISTRY_ID \
  --source deployer \
  --network testnet \
  -- upload_record \
  --patient $DEPLOYER_ADDRESS \
  --ipfs_hash "QmTestHashForCareVaultVerification123456789" \
  --category 1 \
  --file_size_kb 512)

echo "Upload result: $UPLOAD_TX"
echo ""

echo "Reading back records..."
stellar contract invoke \
  --id $RECORD_REGISTRY_ID \
  --source deployer \
  --network testnet \
  -- get_records \
  --patient $DEPLOYER_ADDRESS

echo ""
echo "Testing AccessControl contract..."
echo "Granting access to doctor..."

GRANT_TX=$(stellar contract invoke \
  --id $ACCESS_CONTROL_ID \
  --source deployer \
  --network testnet \
  -- grant_access \
  --patient $DEPLOYER_ADDRESS \
  --doctor $DOCTOR_ADDRESS \
  --record_ids '["1"]' \
  --expires_at $EXPIRES_AT)

echo "Grant result: $GRANT_TX"
echo ""

echo "Checking active grants..."
stellar contract invoke \
  --id $ACCESS_CONTROL_ID \
  --source deployer \
  --network testnet \
  -- get_active_grants \
  --patient $DEPLOYER_ADDRESS

echo ""
echo "Checking doctor access..."
stellar contract invoke \
  --id $ACCESS_CONTROL_ID \
  --source deployer \
  --network testnet \
  -- check_access \
  --doctor $DOCTOR_ADDRESS \
  --patient $DEPLOYER_ADDRESS

echo ""
echo "✅ Test invocations complete"
echo "View transactions on Stellar Expert:"
echo "https://stellar.expert/explorer/testnet"
