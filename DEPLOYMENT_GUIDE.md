# CareVault Soroban Deployment Guide

## Overview
CareVault smart contracts have been implemented on Stellar Testnet with complete frontend integration.

## Quick Start

### 1. Fund Test Identities
```bash
bash scripts/fund_identities.sh
```

### 2. Build Contracts
```bash
cargo build --release --target wasm32-unknown-unknown
```

### 3. Deploy to Testnet
```bash
bash scripts/deploy.sh
```

### 4. Run Invocation Tests
```bash
bash scripts/invoke_test.sh
```

### 5. Verify Deployment
```bash
bash scripts/verify.sh
```

## Deployed Contracts

- **RecordRegistry**: Upload, verify, and manage medical records on-chain
- **AccessControl**: Grant and revoke time-limited access to records

## Frontend Integration

### Hooks Available
- `useRecords()` - Read/write medical records
- `useAccessGrants()` - Manage access grants
- `useAuditLog()` - Track all on-chain actions

### Example Usage
```tsx
const { records, upload, loading } = useRecords({ walletAddress });
await upload(file, 'Prescription');
```

## Environment Setup

Update `.env.testnet` after deployment:
```
VITE_RECORD_REGISTRY_CONTRACT_ID=<contract_id>
VITE_ACCESS_CONTROL_CONTRACT_ID=<contract_id>
```

## Smart Contract Features

### RecordRegistry
- `upload_record()` - Encrypt and store medical document
- `get_records()` - List patient's active records
- `verify_record()` - Admin verification
- `delete_record()` - Patient-controlled deletion

### AccessControl
- `grant_access()` - Create time-bound access grants
- `revoke_access()` - Immediately revoke access
- `get_active_grants()` - List patient's active grants
- `check_access()` - Verify doctor has access
- `get_doctor_grants()` - List doctor's access grants

## Storage Schema

### RecordRegistry
- `ADMIN` - Contract administrator
- `RECORD_COUNTER` - Global record ID counter
- `Record(id)` - MedicalRecord struct
- `PatientRecords(address)` - Vec of record IDs per patient

### AccessControl
- `ADMIN` - Contract administrator
- `GRANT_COUNTER` - Global grant ID counter
- `Grant(id)` - AccessGrant struct
- `PatientGrants(address)` - Vec of grant IDs per patient
- `DoctorGrants(address)` - Vec of grant IDs per doctor

## Key Features Implemented

✅ Full Soroban contract layer
✅ TTL extension on persistent storage (100-500 ledgers)
✅ Event emission for all state mutations
✅ Complete frontend hook integration
✅ Demo mode support (?demo=true)
✅ GitHub Actions CI/CD workflow
✅ Comprehensive deployment scripts
✅ TypeScript strict mode compliance
✅ IPFS integration ready
✅ Freighter wallet integration

## Next Steps

1. Configure Pinata JWT in `.env.testnet` for IPFS uploads
2. Deploy to Vercel with production environment variables
3. Implement real transaction signing in production
4. Gather user feedback and test with real medical data
