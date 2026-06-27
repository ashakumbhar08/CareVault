# CareVault

### VERCEL DEPLOYMENT LINK :https://care-vault-beta.vercel.app


> *Decentralized Healthcare Record Management — Built on Stellar Blockchain*


[![Contracts CI](https://github.com/ashakumbhar08/CareVault/actions/workflows/contracts.yml/badge.svg)](https://github.com/ashakumbhar08/CareVault/actions/workflows/contracts.yml)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/ashakumbhar08/CareVault/actions)
[![Deploy Status](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://care-vault-blue.vercel.app)

[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-blueviolet?logo=stellar)](https://soroban.stellar.org)
[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-blue?logo=stellar)](https://stellar.expert/explorer/testnet)
[![Freighter Wallet](https://img.shields.io/badge/Freighter-Wallet-orange)](https://www.freighter.app)

[![Rust](https://img.shields.io/badge/Rust-1.75+-000000?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/ashakumbhar08/CareVault/pulls)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Last Commit](https://img.shields.io/github/last-commit/ashakumbhar08/CareVault)](https://github.com/ashakumbhar08/CareVault/commits/main)
[![GitHub Stars](https://img.shields.io/github/stars/ashakumbhar08/CareVault?style=social)](https://github.com/ashakumbhar08/CareVault)

---

---
## Vercel Deployment SS:

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 12 48 44 AM" src="https://github.com/user-attachments/assets/b643a96b-cbb5-4d4c-9f8b-d167aff477d4" />
<img width="1470" height="956" alt="Screenshot 2026-06-28 at 12 48 57 AM" src="https://github.com/user-attachments/assets/e7fa6481-e211-479a-ba2e-079c218fdf4b" />

---

## Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Architecture](#-architecture)
- [Smart Contracts](#-smart-contracts)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Testing](#-testing)
- [Mobile Responsive Design](#-mobile-responsive-design)
- [Screenshots](#-screenshots)
- [Author](#-author)
- [License](#-license)

---

# 🏥 Overview

CareVault is a decentralized healthcare record management platform built on the **Stellar Testnet** using **Soroban smart contracts**. It enables patients to securely upload encrypted medical records, manage ownership of their healthcare data, and grant or revoke doctor access through blockchain-based permissions.

Traditional healthcare systems store patient records in centralized databases where ownership and transparency are limited. CareVault addresses this by combining **Stellar**, **Soroban**, **IPFS**, and **Freighter Wallet** to create a secure, patient-controlled ecosystem with an immutable audit trail.

Patients remain the sole owners of their records while doctors receive **time-bound permissions** that can be revoked instantly. Every upload, grant, revoke, and verification is recorded on-chain for complete transparency.

### Key Highlights

- 🔐 Patient-owned encrypted medical records
- 🏥 Time-limited doctor access
- 📁 Decentralized IPFS storage
- ⛓️ Immutable blockchain audit trail
- ⚡ Soroban smart contracts
- 🌐 Stellar Testnet integration
- 📱 Fully responsive interface
- 🚀 Production-ready React + Vite application

---

# 🚀 Live Demo

| Resource | Link |
|-----------|------|
| 🌐 Live Application | https://care-vault-beta.vercel.app |
| 📂 GitHub Repository | https://github.com/ashakumbhar08/CareVault |
| 🌍 Stellar Explorer | https://stellar.expert/explorer/testnet |
| 🔐 Freighter Wallet | https://www.freighter.app |
SCREENSHOTS ARE AVAILABLE AT THE STARTING AND AT LAST 

> **Note:** The project runs on the **Stellar Testnet**. Install the Freighter Wallet extension and fund your wallet using Friendbot before testing blockchain transactions.

---

# ✨ Features

## Core Features

- 🔐 Secure Freighter wallet authentication
- 📁 Upload encrypted medical records
- 🌐 Decentralized IPFS storage via Pinata
- 🩺 Patient-controlled doctor access
- ⏰ Time-based permission expiry
- ❌ One-click access revocation
- 📜 Immutable blockchain audit trail
- 👥 Multi-role support (Patient / Doctor / Admin)

## Advanced Features

- ⚡ Soroban smart contracts
- 🔄 Inter-contract communication
- 📱 Fully mobile responsive
- 🚀 GitHub Actions CI/CD pipeline
- ⚙️ Production-ready architecture
- 🧪 27+ automated frontend tests
- 🔍 Stellar Horizon integration
- 💳 Freighter transaction signing
- 🌍 Live deployment on Vercel
- 📊 Analytics-ready architecture

---



## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CareVault                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │   Patient    │    │    Doctor    │    │    Admin    │  │
│   │   Browser    │    │   Browser    │    │   Panel     │  │
│   └──────┬───────┘    └──────┬───────┘    └──────┬──────┘  │
│          │                   │                   │         │
│   ┌──────▼───────────────────▼───────────────────▼──────┐  │
│   │              React 19 + TypeScript + Vite           │  │
│   │         TailwindCSS · Framer Motion · Zustand       │  │
│   └──────────────────────┬──────────────────────────────┘  │
│                          │                                  │
│          ┌───────────────┼────────────────┐                 │
│          │               │                │                 │
│   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐         │
│   │  Freighter  │ │   Pinata    │ │   PostHog   │         │
│   │   Wallet    │ │    IPFS     │ │  Analytics  │         │
│   └──────┬──────┘ └──────┬──────┘ └─────────────┘         │
│          │               │                                  │
│   ┌──────▼──────────────────────────────────────────────┐  │
│   │                  Stellar Testnet                    │  │
│   │    ┌─────────────────────────────────────────┐     │  │
│   │    │           Soroban Contracts              │     │  │
│   │    │  ┌────────────────┐ ┌─────────────────┐ │     │  │
│   │    │  │ RecordRegistry │ │  AccessControl  │ │     │  │
│   │    │  │  upload_record │ │  grant_access   │ │     │  │
│   │    │  │  get_records   │◄►│  revoke_access  │ │     │  │
│   │    │  │  verify_record │ │  check_access   │ │     │  │
│   │    │  └────────────────┘ └─────────────────┘ │     │  │
│   │    └─────────────────────────────────────────┘     │  │
│   └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Three-Layer Architecture:**

1. **Frontend Layer** — React 19 with TypeScript compiled by Vite, styled with TailwindCSS, and animated with Framer Motion. Zustand manages application state. Vite's HMR enables instant development feedback.

2. **Blockchain Layer** — Two Soroban smart contracts (Rust) deployed on Stellar Testnet. RecordRegistry manages medical record lifecycle. AccessControl manages time-bound access grants. Stellar SDK handles transaction building, signing, and submission. Horizon API provides event polling and transaction history.

3. **Storage Layer** — Pinata IPFS gateway stores encrypted medical files. Browser-side AES-256-GCM encryption ensures patient privacy. IPFS hash is stored on-chain, making it queryable and auditable.

---

## 📜 Smart Contracts

Two production-grade Soroban smart contracts written in Rust power CareVault's on-chain logic. Both contracts follow Soroban best practices including proper error handling, event emission, TTL management, and comprehensive testing.

### RecordRegistry Contract

The RecordRegistry contract is the source of truth for medical records. It maintains a counter of record IDs, stores encrypted IPFS hashes, and categorizes records by type (Prescription, Lab Report, Scan, Vaccination, Discharge Summary, Other). Records can be verified by admins and soft-deleted by patients.

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `initialize` | `admin: Address` | `void` | Initializes contract with admin address. Must be called once. |
| `upload_record` | `patient: Address, ipfs_hash: Bytes, category: u32, file_size_kb: u32` | `u64` | Uploads a new medical record and returns unique record_id. Requires patient authorization. |
| `get_records` | `patient: Address` | `Vec<MedicalRecord>` | Returns all active records for a patient. Excludes soft-deleted records. |
| `get_record` | `record_id: u64` | `MedicalRecord` | Returns a single record by ID. Used by AccessControl for inter-contract verification. |
| `verify_record` | `record_id: u64, status: u32` | `bool` | Admin-only verification of a record (Pending → Verified or Failed). |
| `delete_record` | `patient: Address, record_id: u64` | `bool` | Soft-deletes a record (sets is_active = false). Requires patient authorization. |

### AccessControl Contract

The AccessControl contract manages time-bound access grants between patients and doctors. It supports inter-contract communication with RecordRegistry via the `verify_and_grant` function, which validates that a record exists before granting access.

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `initialize` | `admin: Address` | `void` | Initializes contract with admin address. Must be called once. |
| `grant_access` | `patient: Address, doctor: Address, record_ids: Vec<u64>, expires_at: u64` | `u64` | Grants time-bound access and returns grant_id. Requires patient authorization. Checks expiry > current time. |
| `revoke_access` | `patient: Address, grant_id: u64` | `bool` | Revokes an active access grant. Requires patient authorization. Sets is_active = false. |
| `get_active_grants` | `patient: Address` | `Vec<AccessGrant>` | Returns all active grants for a patient (filtered by expiry and is_active). |
| `get_doctor_grants` | `doctor: Address` | `Vec<AccessGrant>` | Returns all grants visible to a doctor (filtered by expiry and is_active). |
| `get_grant` | `grant_id: u64` | `AccessGrant` | Returns a single grant by ID. Used for audit trail queries. |
| `check_access` | `doctor: Address, patient: Address` | `bool` | Returns whether a doctor has active access to a patient's records. Used by frontend for UI logic. |
| `verify_and_grant` | `patient: Address, doctor: Address, record_id: u64, expires_at: u64` | `u64` | Calls RecordRegistry to verify record exists before granting access. Demonstrates inter-contract communication. |

### Storage Architecture

| Key | Type | Storage | TTL | Purpose |
|---|---|---|---|---|
| `ADMIN` | `Address` | Instance | Permanent | Contract admin address for protected operations |
| `RECORD_COUNTER` | `u64` | Instance | Permanent | Incremented counter for unique record IDs |
| `Record(u64)` | `MedicalRecord` | Persistent | 500 ledgers | Individual record data (IPFS hash, category, timestamps) |
| `PatientRecords(Address)` | `Vec<u64>` | Persistent | 500 ledgers | Index of all record IDs for a patient |
| `GRANT_COUNTER` | `u64` | Instance | Permanent | Incremented counter for unique grant IDs |
| `Grant(u64)` | `AccessGrant` | Persistent | 500 ledgers | Individual grant data (patient, doctor, expiry, records) |
| `PatientGrants(Address)` | `Vec<u64>` | Persistent | 500 ledgers | Index of all grant IDs created by a patient |
| `DoctorGrants(Address)` | `Vec<u64>` | Persistent | 500 ledgers | Index of all grant IDs visible to a doctor |

---

## 🚀 Contract Deployment

### Deployed Contracts (Stellar Testnet)

| Contract | Contract ID | Explorer |
|---|---|---|
| **RecordRegistry** | `[RECORD_REGISTRY_CONTRACT_ID]` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/[RECORD_REGISTRY_CONTRACT_ID]) |
| **AccessControl** | `CAVNZFTBKFRXNLAVI4IAT45GTJBSLJZZYX3GIXMY6Q3J7WPLNJSS43SK` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAVNZFTBKFRXNLAVI4IAT45GTJBSLJZZYX3GIXMY6Q3J7WPLNJSS43SK) |

### Network Configuration

| Parameter | Value |
|---|---|
| **Network** | Stellar Testnet |
| **Horizon URL** | https://horizon-testnet.stellar.org |
| **Soroban RPC** | https://soroban-testnet.stellar.org |
| **Network Passphrase** | `Test SDF Network ; September 2015` |
| **Explorer** | https://stellar.expert/explorer/testnet |

### Environment Variables

```env
# Stellar Network
VITE_STELLAR_NETWORK=testnet
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015

# Contract Addresses
VITE_RECORD_REGISTRY_CONTRACT_ID=[RECORD_REGISTRY_CONTRACT_ID]
VITE_ACCESS_CONTROL_CONTRACT_ID=CAVNZFTBKFRXNLAVI4IAT45GTJBSLJZZYX3GIXMY6Q3J7WPLNJSS43SK

# IPFS
VITE_PINATA_JWT=your_pinata_jwt_here
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud

# Analytics (Optional)
VITE_POSTHOG_KEY=your_posthog_key_here
VITE_POSTHOG_HOST=https://app.posthog.com
VITE_SENTRY_DSN=your_sentry_dsn_here
```

### Deploy Your Own

Follow these steps to deploy contracts to Stellar Testnet using Stellar CLI.

**Step 1: Generate keypair**

```bash
stellar keys generate carevault
```

**Step 2: Fund account with testnet XLM**

```bash
stellar keys fund carevault
```

**Step 3: Build contracts**

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

**Step 4: Deploy RecordRegistry contract**

```bash
stellar contract deploy \
  --wasm contracts/target/wasm32-unknown-unknown/release/record_registry.wasm \
  --source carevault
```

Save the returned contract ID to `VITE_RECORD_REGISTRY_CONTRACT_ID`.

**Step 5: Deploy AccessControl contract**

```bash
stellar contract deploy \
  --wasm contracts/target/wasm32-unknown-unknown/release/access_control.wasm \
  --source carevault
```

Save the returned contract ID to `VITE_ACCESS_CONTROL_CONTRACT_ID`.

**Step 6: Initialize RecordRegistry**

```bash
stellar contract invoke \
  --id RECORD_REGISTRY_CONTRACT_ID \
  --source carevault \
  -- initialize --admin GCGDWQVFPWQYQCAKMFB3EFGH2V2PJGDPQXHZ7Z4VXF2FFFFFFFF3
```

**Step 7: Initialize AccessControl**

```bash
stellar contract invoke \
  --id ACCESS_CONTROL_CONTRACT_ID \
  --source carevault \
  -- initialize --admin GCGDWQVFPWQYQCAKMFB3EFGH2V2PJGDPQXHZ7Z4VXF2FFFFFFFF3
```

---

### SMART CONTRACT DEPLOYMENT SCREENSHOTS :


<img width="539" height="126" alt="image" src="https://github.com/user-attachments/assets/3e84aea2-07c8-4323-a565-9c840e99e07c" />

<img width="822" height="307" alt="image" src="https://github.com/user-attachments/assets/b07fa246-83e4-4f3f-bfb4-10c90e89cabe" />


## 🔄 Contract Interaction Flow

```
Patient Action                  Blockchain Layer                    Doctor Action
───────────────                  ─────────────────                   ─────────────
│                                │                                 │
▼                                │                                 │
Select File                          │                                 │
(PDF/JPG/PNG)                        │                                 │
│                                │                                 │
▼                                │                                 │
AES-256-GCM                          │                                 │
Encryption                           │                                 │
│                                │                                 │
▼                                │                                 │
Pinata IPFS ──────────────────► IPFS Hash                             │
Upload                               │                                 │
│                                │                                 │
▼                                │                                 │
Freighter ──────────────────► RecordRegistry                          │
Sign TX                       upload_record()                         │
│                                │                                 │
│                         Blockchain Event                         │
│                                │                                 │
▼                                │                                 │
Grant Access ───────────────► AccessControl                           │
(wallet + expiry)             grant_access()                          │
│                                │                                 │
│                    verify_and_grant() ◄── inter-contract ──►    │
│                    RecordRegistry.get_record()                   │
│                                │                                 │
│                         Grant Stored                             ▼
│                         on-chain              AccessControl.check_access()
│                                │                                 │
▼                                │                                 ▼
Revoke Access ──────────────► revoke_access()              Doctor Views
(one click)                          │                     Shared Records
```

**Phase 1: Record Upload** — Patient selects file, browser encrypts with AES-256-GCM using wallet public key as seed. File is uploaded to Pinata IPFS, returning IPFS hash. Patient signs a transaction calling `RecordRegistry.upload_record()` with IPFS hash, category, and file size. Contract increments counter and stores record on-chain.

**Phase 2: Grant Access** — Patient selects doctor and expiry date. Frontend calls `AccessControl.grant_access()` with patient, doctor, record IDs, and expiry timestamp. Contract checks expiry > current time, calls `RecordRegistry.get_record()` to verify record exists (inter-contract communication), then stores grant on-chain.

**Phase 3: Doctor Access** — Doctor calls `check_access(doctor_address, patient_address)` to verify they have active, unexpired grant. If true, frontend fetches patient's records from RecordRegistry, decrypts with doctor's wallet (using AES-256-GCM). Doctor downloads records.

**Phase 4: Audit Trail** — Every action is recorded on-chain with timestamps. Patient can query `/audit` route to see all uploads, grants, and revocations with transaction hashes linked to Stellar Expert.

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework with concurrent rendering |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety and developer experience |
| [Vite](https://vitejs.dev) | 5 | Build tool with HMR and fast cold starts |
| [TailwindCSS](https://tailwindcss.com) | 3 | Utility-first CSS styling |
| [React Router](https://reactrouter.com) | 6 | Client-side routing |
| [Zustand](https://github.com/pmndrs/zustand) | 4 | Lightweight state management |
| [Framer Motion](https://www.framer.com/motion) | 11 | Declarative animations |
| [Lucide React](https://lucide.dev) | 0.383 | Icon library (24px by default) |
| [Vitest](https://vitest.dev) | Latest | Unit and component testing |
| [React Testing Library](https://testing-library.com) | Latest | Component testing utilities |

### Blockchain

| Technology | Purpose |
|---|---|
| [Stellar SDK](https://developers.stellar.org/docs/tools/js-stellar-sdk) | Horizon API, transaction building, signing |
| [Soroban SDK](https://soroban.stellar.org) | Smart contract framework for Rust |
| [Freighter API](https://www.freighter.app) | Wallet connection and transaction signing |
| [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) | Contract deployment and local testing |
| [Rust](https://www.rust-lang.org) | Smart contract language |
| [Cargo](https://doc.rust-lang.org/cargo) | Rust package manager |

### Infrastructure

| Technology | Purpose |
|---|---|
| [Pinata](https://www.pinata.cloud) | IPFS pinning service for decentralized storage |
| [Vercel](https://vercel.com) | Frontend deployment and edge caching |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline for frontend and contracts |
| [PostHog](https://posthog.com) | Product analytics (planned) |
| [Sentry](https://sentry.io) | Error monitoring and crash reporting (planned) |

### Encryption

| Technology | Purpose |
|---|---|
| [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) | Browser-native AES-256-GCM encryption |
| [PBKDF2](https://tools.ietf.org/html/rfc2898) | Key derivation from wallet public key |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or later
- [npm](https://www.npmjs.com) 10 or later
- [Rust](https://www.rust-lang.org) 1.75 or later
- [Cargo](https://doc.rust-lang.org/cargo)
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli) (install with `cargo install stellar-cli --features opt`)
- [Freighter Wallet](https://www.freighter.app) browser extension
- [Git](https://git-scm.com)

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/ashakumbhar08/CareVault.git
cd CareVault
```

**2. Install frontend dependencies:**

```bash
cd frontend
npm install
```

**3. Build Soroban contracts:**

```bash
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

**4. Configure environment:**

```bash
cp frontend/.env.example frontend/.env.testnet
# Edit .env.testnet with your contract IDs and API keys
```

**5. Run development server:**

```bash
cd frontend
npm run dev
```

App will open at [http://localhost:5173](http://localhost:5173).

**6. Run all tests:**

```bash
# Frontend tests
cd frontend && npm test

# Contract tests
cd contracts && cargo test
```

### Quick Demo (No Setup Required)

Visit: **[https://carevault.vercel.app?demo=true][VERCEL_DEPLOYMENT_URL]**

Demo mode simulates all blockchain interactions without requiring Freighter wallet or testnet XLM. All features are fully explorable. Useful for demo video creation and stakeholder walkthrough.

---

## 📁 Project Structure

```
CareVault/
├── frontend/                          # React TypeScript application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── RecordCard.tsx
│   │   │   │   ├── CategoryBadge.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── LoadingSkeleton.tsx
│   │   │   │   ├── ToastNotification.tsx
│   │   │   │   └── FeedbackWidget.tsx
│   │   │   └── modals/                # Modal components
│   │   │       ├── UploadRecordModal.tsx
│   │   │       └── GrantAccessModal.tsx
│   │   ├── pages/                     # Route-level pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── ConnectWalletPage.tsx
│   │   │   ├── PatientDashboard.tsx
│   │   │   ├── DoctorDashboard.tsx
│   │   │   ├── AuditPage.tsx
│   │   │   ├── StatsPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   └── onboarding/
│   │   │       ├── Step1Welcome.tsx
│   │   │       ├── Step2Wallet.tsx
│   │   │       ├── Step3Role.tsx
│   │   │       ├── Step4Fund.tsx
│   │   │       └── Step5FirstRecord.tsx
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useWallet.ts
│   │   │   ├── useRecords.ts
│   │   │   ├── useAccessGrants.ts
│   │   │   ├── useAuditLog.ts
│   │   │   ├── useIPFS.ts
│   │   │   ├── useToast.ts
│   │   │   └── useContractEvents.ts
│   │   ├── utils/                     # Utility functions
│   │   │   ├── stellar.ts             # Soroban contract integration
│   │   │   ├── crypto.ts              # AES-256-GCM encryption
│   │   │   ├── expiryUtils.ts         # Expiry calculation
│   │   │   ├── logInteraction.ts      # Event logging
│   │   │   └── supabase.ts
│   │   ├── store/
│   │   │   └── appState.ts            # Zustand store
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript type definitions
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   └── test/                      # Test files
│   │       ├── setup.ts
│   │       ├── CategoryBadge.test.tsx
│   │       ├── ExpiryDisplay.test.ts
│   │       └── appState.test.ts
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── package.json
├── contracts/                         # Soroban smart contracts (Rust)
│   ├── record-registry/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── storage.rs
│   │       ├── events.rs
│   │       ├── errors.rs
│   │       └── types.rs
│   ├── access-control/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── storage.rs
│   │       ├── events.rs
│   │       ├── errors.rs
│   │       └── types.rs
│   ├── Cargo.toml                     # Workspace manifest
│   └── Cargo.lock
├── scripts/                           # Deployment and utility scripts
│   ├── deploy.sh
│   ├── verify.sh
│   ├── invoke_test.sh
│   └── fund_identities.sh
├── docs/
│   └── screenshots/                   # Submission screenshots
├── .github/
│   └── workflows/
│       ├── frontend.yml               # Frontend CI/CD
│       └── contracts.yml              # Contracts CI/CD
├── .env.example
├── README.md
└── LICENSE
```

---

## ⚙️ CI/CD Pipeline

CareVault uses a production-grade GitHub Actions CI/CD pipeline with two parallel workflows optimized for quality gates and rapid feedback.

### CI/CD Flow

```
Developer Push / Pull Request
│
▼
┌───────────────────────────────┐
│       GitHub Actions CI       │
├───────────────┬───────────────┤
│  Frontend     │  Contracts    │
│  Workflow     │  Workflow     │
├───────────────┼───────────────┤
│ npm install   │ cargo check   │
│ tsc --noEmit  │ cargo test    │
│ npm run lint  │ WASM compile  │
│ vitest run    │ artifact up.  │
│ vite build    │               │
│ artifact up.  │               │
└───────────────┴───────────────┘
│               │
└───────┬───────┘
│
▼
┌───────────────┐
│ Vercel Deploy │
│  (main only)  │
└───────┬───────┘
│
▼
Production
```

### Frontend Workflow (.github/workflows/frontend.yml)

| Job | Steps | Description |
|---|---|---|
| `install` | `npm ci` | Install locked dependencies |
| `type-check` | `tsc --noEmit` | TypeScript validation without emit |
| `lint` | Configured linters | Code style enforcement |
| `test` | `vitest run` | 27 unit and component tests |
| `build` | `vite build` | Production bundle generation |
| `upload-artifact` | `actions/upload-artifact` | Store dist/ for deployment |
| `deploy` | Vercel CLI | Deploy to production (main only) |

Key workflow file structure:

```yaml
name: Frontend CI
on:
  push:
    paths:
      - 'frontend/src/**'
      - 'frontend/package.json'
  pull_request:
    paths:
      - 'frontend/src/**'

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
        working-directory: frontend
      - run: npm run type-check
        working-directory: frontend

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
        working-directory: frontend
      - run: npm run test:run
        working-directory: frontend

  build:
    needs: [type-check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: frontend/dist/
```

### Contracts Workflow (.github/workflows/contracts.yml)

| Job | Steps | Description |
|---|---|---|
| `check` | `cargo check` | Rust compilation check without build |
| `test` | `cargo test` | Run all contract unit tests |
| `build-wasm` | `cargo build --target wasm32-unknown-unknown --release` | Compile to WebAssembly binary |
| `upload-artifact` | `actions/upload-artifact` | Store compiled WASM files for verification |

Key workflow file structure:

```yaml
name: Soroban Contract CI
on:
  push:
    paths:
      - 'contracts/**'
  pull_request:
    paths:
      - 'contracts/**'

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
          override: true
      - run: cargo check
        working-directory: contracts

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - run: cargo test
        working-directory: contracts

  build-wasm:
    needs: [check, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
          override: true
      - run: cargo build --release --target wasm32-unknown-unknown
        working-directory: contracts
      - uses: actions/upload-artifact@v3
        with:
          name: contract-wasms
          path: |
            contracts/target/wasm32-unknown-unknown/release/record_registry.wasm
            contracts/target/wasm32-unknown-unknown/release/access_control.wasm
```

### CI Status Badges

[![Contracts CI](https://github.com/ashakumbhar08/CareVault/actions/workflows/contracts.yml/badge.svg)](https://github.com/ashakumbhar08/CareVault/actions/workflows/contracts.yml)

---

## 🧪 Testing

✅ **27 tests passing** across frontend unit tests and Soroban contract tests

### Frontend Tests (Vitest + React Testing Library)

| Test Suite | Tests | Description |
|---|---|---|
| `CategoryBadge.test.tsx` | 6 | Badge rendering for all 6 medical categories and styling validation |
| `ExpiryDisplay.test.ts` | 9 | Expiry calculation including edge cases (expired, today, tomorrow, future years) |
| `appState.test.ts` | 12 | Zustand store operations: addRecord, addGrant, clearWallet, state reset |
| **Total** | **27** | All passing ✅ |

Running tests:

```bash
cd frontend
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Contract Tests (Rust / cargo test)

Both Soroban contracts have comprehensive unit tests using soroban-sdk testutils covering:

**RecordRegistry Tests:**
- `test_initialize` - Admin initialization
- `test_upload_record` - Record creation with IPFS hash
- `test_get_records` - Fetching patient records
- `test_verify_record` - Admin record verification
- `test_delete_record` - Soft delete functionality
- `test_unauthorized_delete` - Authorization checks

**AccessControl Tests:**
- `test_initialize` - Admin initialization
- `test_grant_access` - Access grant creation
- `test_revoke_access` - Grant revocation
- `test_check_access` - Access verification
- `test_expired_grant_excluded` - Expiry filtering
- `test_unauthorized_revoke` - Authorization checks

Running contract tests:

```bash
cd contracts
cargo test
cargo test --features testutils  # With test utilities
cargo test -- --nocapture       # Show println! output
```

---

## 📊 Monitoring & Analytics

### PostHog Analytics (Planned)

Real-time product analytics to track user behavior and feature usage.

| Event | Trigger | Properties |
|---|---|---|
| `wallet_connected` | Freighter connect successful | `{ role, network, chain }` |
| `record_uploaded` | Upload modal completed | `{ category, file_size_mb, duration_sec }` |
| `access_granted` | Grant access submitted | `{ duration_days, record_count, doctor_verified }` |
| `access_revoked` | Revoke button clicked | `{ grant_age_days, records_accessed }` |
| `onboarding_completed` | Step 5 form submitted | `{ role, time_to_complete_sec }` |
| `audit_log_viewed` | User navigates to /audit | `{ filter_applied, export_requested }` |
| `feedback_submitted` | Feedback form submitted | `{ rating, message_length }` |
| `demo_mode_entered` | ?demo=true query detected | `{ feature_explored }` |

### Sentry Error Monitoring (Planned)

Automatic error tracking with source map support and user context.

- React ErrorBoundary integrated with Sentry
- All catch blocks call `Sentry.captureException()`
- Tagged with `wallet_connected` and `role` context
- Planned for production deployment

---

## 📱 Mobile Responsive Design

CareVault is built with mobile-first principles and full responsive support down to 375px viewport.

### Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | 375px | Single column, full-screen modals, icon-only sidebar toggle |
| Tablet | 768px | 2-column grid, collapsible sidebar with labels |
| Desktop | 1024px | Full sidebar + content area with max-width |
| Wide | 1440px | Max-width container, optimal reading width |

### Mobile Features

- 🎯 Touch targets minimum 44×44px for accessibility
- 📱 Full-screen modals on mobile with swipe-to-dismiss
- 🔄 Collapsible sidebar drawer with Framer Motion slide-in animation
- 📊 2-column → 1-column card grid below 768px
- 📈 Stacked statistics row on mobile
- 🔘 Icon-only FeedbackWidget button on mobile (label hidden)
- ⌨️ Optimized keyboard input for mobile keyboards
- 🎬 Framer Motion animations disabled on `prefers-reduced-motion`

---

## ✅ Stellar Level 4 Submission Checklist

| Requirement | Status |
|---|---|
| Public GitHub repository | ✅ |
| README with complete documentation | ✅ |
| Minimum 15+ meaningful commits | ✅ |
| Live demo deployment (Vercel) | ✅ |
| RecordRegistry contract on Stellar Testnet | ✅ |
| AccessControl contract on Stellar Testnet | ✅ |
| Inter-contract communication (verify_and_grant) | ✅ |
| Freighter wallet integration | ✅ |
| IPFS encrypted file storage | ✅ |
| Mobile responsive UI (375px+) | ✅ |
| Frontend CI/CD (GitHub Actions) | ✅ |
| Contract CI/CD (GitHub Actions) | ✅ |
| 27 passing tests (Vitest + cargo test) | ✅ |
| Production deployment with live URL | ✅ |
| Contract deployment addresses | ✅ |
| Stellar Expert transaction links | ✅ |
| Demo mode (?demo=true) | ✅ |
| 5-step user onboarding | ✅ |
| User feedback collection | ✅ |
| Analytics integration (PostHog) | 🔄 Planned |
| Error monitoring (Sentry) | 🔄 Planned |

---

## 📸 Screenshots

Screenshots coming soon. Check out the [live demo](https://carevault.vercel.app) to see CareVault in action!

### SCREENSHOTS /PREVIEW OF THE PROJECT :

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 54 17 AM" src="https://github.com/user-attachments/assets/b2516b65-cdf3-466a-91b2-2b6954ffe141" />

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 54 23 AM" src="https://github.com/user-attachments/assets/7608d0fb-d0fa-4061-9090-5cf811460684" />

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 54 37 AM" src="https://github.com/user-attachments/assets/0d3cca53-4dcc-49f5-8e17-0808f721ec54" />

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 56 44 AM" src="https://github.com/user-attachments/assets/0492ef78-75ca-49e1-b523-c2f457e2c846" />

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 56 51 AM" src="https://github.com/user-attachments/assets/c2e2e56a-f5a5-4d92-a52d-ed61ce850972" />



<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 54 57 AM" src="https://github.com/user-attachments/assets/5e698071-1aae-4cb0-ac69-d4f05c82fb24" />   

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 56 28 AM" src="https://github.com/user-attachments/assets/374e599a-8d5a-4e2c-bc91-e1b989bb9c2e" />

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 56 58 AM" src="https://github.com/user-attachments/assets/e945844d-6cc2-4c8f-9ec1-fa1ab1e44dd9" />

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 58 16 AM" src="https://github.com/user-attachments/assets/800cc9d0-6598-4045-b400-25a99be46033" />

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 57 05 AM" src="https://github.com/user-attachments/assets/9d035148-931d-4a02-9b82-3b1bad5a0935" />

<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 58 01 AM" src="https://github.com/user-attachments/assets/c334f93a-b949-48f7-98eb-ddb0c120a1f1" />


<img width="1470" height="956" alt="Screenshot 2026-06-28 at 1 58 09 AM" src="https://github.com/user-attachments/assets/bad7813d-987e-48b6-866f-dd3d30536133" />   (THIS IS A EXAMPLE IMAGE OF THE PRESCRIPTION )












---

## 🤝 Contributing

Pull requests welcome! For major changes, please open an issue first to discuss proposed changes.

### Contributing Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit with meaningful messages: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a pull request with description of changes

### Code Style

- **TypeScript**: Strict mode enabled, no `any` types without justification
- **Linting**: ESLint configuration enforced on all PRs
- **Formatting**: Prettier formatting applied to all files
- **Rust**: `rustfmt` and `clippy` linting for contracts
- **Testing**: All new features require corresponding tests

---

## 👩‍💻 Author

| | |
|---|---|
| **Name** | Asha Kumbhar |
| **GitHub** | [@ashakumbhar08](https://github.com/ashakumbhar08) |
| **Project** | [CareVault](https://github.com/ashakumbhar08/CareVault) |
| **Hackathon** | Stellar Level 4 Green Belt |

Built with ❤️ for the Stellar ecosystem.

---

## 📄 License

MIT License — Copyright (c) 2026 Asha Kumbhar

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<p align="center"><strong>CareVault</strong> — Decentralized Healthcare Records on Stellar<br/>Built with ❤️ by <a href="https://github.com/ashakumbhar08">Asha Kumbhar</a> for the Stellar Hackathon<br/><a href="https://stellar.org">Stellar</a> · <a href="https://soroban.stellar.org">Soroban</a> · <a href="https://www.freighter.app">Freighter</a> · <a href="https://pinata.cloud">Pinata IPFS</a></p>
