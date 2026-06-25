# CareVault

A patient-controlled decentralized health record vault built on Stellar.

## Setup

```bash
npm install
npm run dev
```

## Features

- Patient Dashboard: Upload, manage, and share medical records
- Doctor Dashboard: View patient-granted records
- Time-bound access grants with instant revocation
- Immutable audit trail
- Client-side encryption (simulated)
- IPFS storage (simulated)

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion
- React Router v6
- Lucide Icons

## Routes

- `/` - Landing page
- `/connect` - Connect wallet
- `/patient` - Patient dashboard
- `/doctor` - Doctor dashboard
- `/audit` - Audit log

## Mock Data

All interactions use local state with mock data. No blockchain integration in Sprint 1.
