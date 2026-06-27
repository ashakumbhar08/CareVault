# CareVault

A patient-controlled decentralized health record vault built on Stellar.

[![Frontend CI](https://github.com/ashan-io/carevault/actions/workflows/frontend.yml/badge.svg)](https://github.com/ashan-io/carevault/actions/workflows/frontend.yml)
[![Contracts CI](https://github.com/ashan-io/carevault/actions/workflows/contracts.yml/badge.svg)](https://github.com/ashan-io/carevault/actions/workflows/contracts.yml)

## Project Structure

```
carevault/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── modals/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── .env.example
├── contracts/
│   ├── record-registry/
│   │   ├── Cargo.toml
│   │   └── src/
│   ├── access-control/
│   │   ├── Cargo.toml
│   │   └── src/
│   ├── Cargo.toml
│   └── Cargo.lock
├── scripts/
│   ├── deploy.sh
│   ├── verify.sh
│   ├── invoke_test.sh
│   └── fund_identities.sh
├── .github/
│   └── workflows/
│       ├── contracts.yml
│       └── frontend.yml
└── README.md
```

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will open on http://localhost:3000

### Contracts

```bash
cd contracts
cargo build
cargo check
```

## Build

### Frontend
```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

### Contracts
```bash
cd contracts
cargo build --target wasm32-unknown-unknown
```

## Testing

### Frontend Tests

Run all tests:
```bash
cd frontend
npm test
```

Run tests in CI mode (single run):
```bash
cd frontend
npm run test:run
```

Test files:
- `src/test/CategoryBadge.test.tsx` - Component rendering and styling
- `src/test/ExpiryDisplay.test.ts` - Expiry date calculation and formatting
- `src/test/appState.test.ts` - State management operations

## Features

- Patient Dashboard: Upload, manage, and share medical records
- Doctor Dashboard: View patient-granted records
- Time-bound access grants with instant revocation
- Immutable audit trail
- Multi-format file support (PDF, JPG, PNG)
- IPFS integration (with local fallback)
- Freighter wallet integration

## Tech Stack

- **Frontend**: React 19 + TypeScript, Tailwind CSS v4, Framer Motion, React Router v6, Lucide Icons
- **Contracts**: Soroban, Rust

## Routes

- `/` - Landing page
- `/connect` - Connect wallet
- `/patient` - Patient dashboard
- `/doctor` - Doctor dashboard
- `/audit` - Audit log

## Environment Variables

Create `frontend/.env` or `frontend/.env.testnet`:

```
VITE_STELLAR_NETWORK=testnet
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_RECORD_REGISTRY_CONTRACT_ID=
VITE_ACCESS_CONTROL_CONTRACT_ID=
VITE_PINATA_JWT=
```

## State Management

- In-memory state (appState.ts) for MVP
- SessionStorage for wallet session
- Real Freighter wallet integration
