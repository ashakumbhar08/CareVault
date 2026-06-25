#!/bin/bash
set -e

RECORD_REGISTRY_ID=$(cat .contract_ids/record_registry_id.txt)
ACCESS_CONTROL_ID=$(cat .contract_ids/access_control_id.txt)
DEPLOYER_ADDRESS=$(stellar keys address deployer)

echo "Verifying RecordRegistry deployment..."
RECORD_RESULT=$(stellar contract invoke \
  --id $RECORD_REGISTRY_ID \
  --network testnet \
  -- get_record \
  --record_id 1 2>&1) || RECORD_FAILED=1

if [ -z "$RECORD_FAILED" ]; then
  echo "✅ RecordRegistry responsive"
  echo "$RECORD_RESULT"
else
  echo "❌ RecordRegistry verification failed"
  echo "$RECORD_RESULT"
  exit 1
fi

echo ""
echo "Verifying AccessControl deployment..."
GRANT_RESULT=$(stellar contract invoke \
  --id $ACCESS_CONTROL_ID \
  --network testnet \
  -- get_active_grants \
  --patient $DEPLOYER_ADDRESS 2>&1) || GRANT_FAILED=1

if [ -z "$GRANT_FAILED" ]; then
  echo "✅ AccessControl responsive"
  echo "$GRANT_RESULT"
else
  echo "❌ AccessControl verification failed"
  echo "$GRANT_RESULT"
  exit 1
fi

echo ""
echo "✅ VERIFICATION PASSED"
echo "Both contracts are deployed and responsive on Stellar Testnet"
