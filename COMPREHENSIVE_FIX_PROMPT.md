# CareVault Repository: Comprehensive Production-Ready Fix Prompt for Kiro AI

## PHASE 1: COMPLETE DIAGNOSTICS (Run First)

Execute ALL diagnostic commands and capture output:

```bash
# Frontend diagnostics
cd frontend
npm install 2>&1 | tee frontend-install.log
npm run type-check 2>&1 | tee frontend-type-check.log
npm run lint 2>&1 | tee frontend-lint.log || true
npm run test:run 2>&1 | tee frontend-test.log
npm run build 2>&1 | tee frontend-build.log

# Contract diagnostics
cd ../contracts
cargo check 2>&1 | tee contracts-check.log
cargo test 2>&1 | tee contracts-test.log
cargo build --target wasm32-unknown-unknown --release 2>&1 | tee contracts-build.log
ls -lh target/wasm32-unknown-unknown/release/*.wasm 2>&1 | tee contracts-wasm.log
```

## PHASE 2: SYSTEMATIC FIXES (In This Order)

### FIX 1: GitHub Actions Workflows

**File: .github/workflows/frontend.yml**
- Replace actions/setup-node with caching enabled
- Add permissions: { contents: read }
- Add timeout-minutes: 30 to each job
- Add concurrency control
- Fix all working-directory paths
- Upgrade upload-artifact to v4

**File: .github/workflows/contracts.yml**
- Replace actions-rs/toolchain@v1 with dtolnay/rust-toolchain@stable
- Replace manual caching with Swatinem/rust-cache@v2
- Add verification that WASM files exist after build
- Add timeout-minutes: 60
- Add permissions block
- Upgrade upload-artifact to v4

### FIX 2: TypeScript Strict Mode

**File: frontend/tsconfig.json**
- Ensure: "strict": true
- Ensure: "noImplicitAny": true
- Ensure: "strictNullChecks": true
- Ensure: "resolveJsonModule": true

**Run:**
```bash
cd frontend
npm run type-check 2>&1
```

**Fix ALL errors** - no @ts-ignore allowed

### FIX 3: ESLint Configuration

**File: frontend/.eslintrc.cjs (Create if missing)**
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

**Run:**
```bash
cd frontend
npm run lint 2>&1
```

**Fix ALL violations**

### FIX 4: Frontend Tests

**Run:**
```bash
cd frontend
npm run test:run 2>&1
```

**Ensure output shows:**
```
Test Files  3 passed (3)
Tests  27 passed (27)
```

**Fix any failing tests** before proceeding

### FIX 5: Frontend Build

**Run:**
```bash
cd frontend
npm run build 2>&1
```

**Must show:**
- 0 errors
- dist/ directory created
- Source maps generated
- All assets bundled correctly

**Fix any errors** before proceeding

### FIX 6: Smart Contracts

**Run:**
```bash
cd contracts
cargo check 2>&1
```

**Fix ALL errors** if any

**Run:**
```bash
cargo test 2>&1
```

**Ensure all tests pass**

**Run:**
```bash
cargo build --target wasm32-unknown-unknown --release 2>&1
ls -lh target/wasm32-unknown-unknown/release/*.wasm
```

**Verify:**
- record_registry.wasm exists (> 50KB)
- access_control.wasm exists (> 50KB)

### FIX 7: Vercel Configuration

**Create file: vercel.json**
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install",
  "env": {
    "VITE_STELLAR_NETWORK": "testnet",
    "VITE_HORIZON_URL": "https://horizon-testnet.stellar.org",
    "VITE_SOROBAN_RPC_URL": "https://soroban-testnet.stellar.org",
    "VITE_NETWORK_PASSPHRASE": "Test SDF Network ; September 2015"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600"
        }
      ]
    }
  ]
}
```

### FIX 8: README.md Complete Rewrite

**Remove ALL placeholders** except: [RECORD_REGISTRY_CONTRACT_ID]

**Required sections (in order):**

1. **Hero**
   - Title: CareVault
   - Tagline: Decentralized Healthcare Records on Stellar
   - 30+ working badges (GitHub Actions, deployment, tech stack, license, stars)

2. **Table of Contents** with links to all sections

3. **Overview** - Problem/solution/why Stellar

4. **Quick Start** - Install, run, test, build

5. **Features Matrix** - Organized checklist with emojis

6. **Architecture** - ASCII diagram with 3 layers

7. **Smart Contracts** - Full API docs for all 14 functions

8. **Deployment** - Step-by-step guide, environment variables

9. **CI/CD** - GitHub Actions workflow explanation

10. **Testing** - 27 tests, how to run

11. **Project Structure** - Full directory tree

12. **Tech Stack** - All technologies listed with versions

13. **Contributing** - Fork, branch, commit, PR guide

14. **Author** - Asha Kumbhar, @ashakumbhar08

15. **License** - MIT

**All badges must be WORKING (test them):**
- GitHub Actions workflows
- shields.io badges
- No placeholder URLs
- No broken image links

### FIX 9: Repository Cleanup

**Remove:**
- Dead code and unused files
- Commented-out code blocks
- Old TODO comments without issues
- Debug console.log statements
- Obsolete documentation

**Fix:**
- All broken links in README
- All incorrect URLs
- All malformed badge syntax
- All dead imports

### FIX 10: Create Meaningful Git Commits

**Commit 1:** `ci: upgrade GitHub Actions to v4 and fix workflows`
- frontend.yml fixes
- contracts.yml fixes
- Add proper permissions, timeouts, concurrency

**Commit 2:** `fix: resolve all TypeScript errors and ESLint violations`
- TypeScript strict mode fixes
- ESLint configuration
- All type errors fixed

**Commit 3:** `fix: ensure all tests pass and build succeeds`
- Fix failing tests (if any)
- Ensure npm run build passes
- Verify all 27 tests passing

**Commit 4:** `fix: resolve smart contract compilation issues`
- cargo check passes
- cargo test passes
- WASM compilation succeeds

**Commit 5:** `deploy: add vercel.json production configuration`
- Create vercel.json
- Configure environment variables
- Set build command and output directory

**Commit 6:** `docs: rewrite README to production-grade quality`
- New comprehensive README
- All working badges
- All sections complete
- No placeholders (except contract ID)

**Commit 7:** `chore: clean up dead code and broken links`
- Remove unused code
- Fix all broken references
- Remove obsolete files

**Commit 8:** `chore: final verification and production readiness`
- Update submission checklist
- Verify all systems working
- Final quality check

## PHASE 3: VERIFICATION CHECKLIST

**ALL of these must pass before considering done:**

- [ ] `npm run type-check` returns 0 errors
- [ ] `npm run lint` returns 0 violations  
- [ ] `npm run test:run` shows 27/27 PASSING
- [ ] `npm run build` succeeds with 0 errors (frontend/dist created)
- [ ] `cargo check` succeeds (0 errors in contracts)
- [ ] `cargo test` succeeds (all tests passing)
- [ ] `cargo build --target wasm32-unknown-unknown --release` succeeds
- [ ] WASM files exist: `ls contracts/target/wasm32-unknown-unknown/release/*.wasm`
- [ ] README has no placeholders except [RECORD_REGISTRY_CONTRACT_ID]
- [ ] All badges in README are working (test each one)
- [ ] No broken links in README (verify with link checker)
- [ ] vercel.json exists and is valid JSON
- [ ] 8 Git commits created with clear messages
- [ ] `git status` shows clean working tree
- [ ] GitHub Actions workflows all passing (green)
- [ ] Vercel deployment working (app loads at root path)
- [ ] All routes work on frontend (no 404 errors)
- [ ] Mobile responsive design working (test at 375px width)
- [ ] No dead code or broken files in repository
- [ ] README renders correctly on GitHub with all badges visible

## PHASE 4: FINAL DELIVERABLES

Kiro must provide:

1. ✅ Modified .github/workflows/frontend.yml (with all fixes)
2. ✅ Modified .github/workflows/contracts.yml (with all fixes)
3. ✅ New vercel.json (production configuration)
4. ✅ Updated README.md (production-grade, no placeholders)
5. ✅ All TypeScript files fixed (npm run type-check passes)
6. ✅ ESLint configuration created (.eslintrc.cjs)
7. ✅ All tests passing (screenshot of 27/27)
8. ✅ All contracts compiling (cargo build success)
9. ✅ Git log showing 8 meaningful commits
10. ✅ Screenshot of GitHub Actions all green
11. ✅ Screenshot of Vercel deployment working
12. ✅ Confirmation that repository is submission-ready

## EXTRA: Critical File Paths

**GitHub Actions:**
- `.github/workflows/frontend.yml`
- `.github/workflows/contracts.yml`

**Configuration:**
- `frontend/tsconfig.json`
- `frontend/.eslintrc.cjs` (CREATE)
- `frontend/vite.config.ts`
- `vercel.json` (CREATE)

**Frontend:**
- `frontend/package.json` (verify scripts)
- `frontend/src/**/*.ts(x)` (fix all errors)
- `README.md` (complete rewrite)

**Contracts:**
- `contracts/Cargo.toml`
- `contracts/record-registry/src/lib.rs`
- `contracts/access-control/src/lib.rs`

---

**THIS SPECIFICATION IS COMPLETE AND MANDATORY. No shortcuts. No incomplete work. Execute ALL sections in order. Do not skip any phase.**
