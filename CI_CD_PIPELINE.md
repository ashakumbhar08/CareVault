# CareVault CI/CD Pipeline

## Overview

CareVault uses GitHub Actions for continuous integration and continuous deployment. The pipeline is split into two distinct jobs: **CI** (Build and Test) and **CD** (Deploy to Vercel).

## Pipeline Structure

```
Push to main / Pull Request
│
▼
┌────────────────────────────────┐
│   CI Job: Build and Test       │
├────────────────────────────────┤
│ • Checkout code                │
│ • Setup Node.js 20             │
│ • npm ci (install)             │
│ • npm run type-check (tsc)     │
│ • npm run lint (tsc)           │
│ • npm run test:run (vitest)    │
│ • npm run build (vite)         │
│ • Verify build artifacts       │
│ • Upload to GitHub artifacts   │
└────────────────┬───────────────┘
                 │
         ✓ Success? 
                 │
         Yes ────┼──── No → Stop
                 │
                 ▼
    ┌────────────────────────────┐
    │ Is main + push event?      │
    └────────────┬───────────────┘
                 │
         Yes ────┼──── No → Stop
                 │
                 ▼
┌────────────────────────────────┐
│   CD Job: Deploy to Vercel     │
├────────────────────────────────┤
│ • Checkout code                │
│ • Setup Node.js 20             │
│ • npm ci (install)             │
│ • npm run build (vite)         │
│ • Install vercel CLI           │
│ • vercel --prod (deploy)       │
│ • Show deployment summary      │
└────────────────┬───────────────┘
                 │
         ✓ Success?
                 │
         Yes ────┼──── No → Error
                 │
                 ▼
            Live on Vercel
         care-vault-q6sd.vercel.app
```

## CI Job: Build and Test

Runs on every push and pull request to main. This job ensures code quality and that the application builds successfully.

### Steps

1. **Checkout code** - Get the repository code
2. **Setup Node.js** - Install Node.js 20 with npm cache
3. **Install dependencies** - `npm ci` (clean install from package-lock.json)
4. **Type check** - `npm run type-check` (tsc --noEmit)
5. **Lint** - `npm run lint` (tsc --noEmit)
6. **Run tests** - `npm run test:run` (vitest --run)
7. **Build** - `npm run build` (tsc && vite build)
8. **Verify artifacts** - Check dist/index.html and dist/assets/ exist
9. **Upload artifacts** - Store dist/ for potential debugging

### Environment Variables

Centralized at workflow level:
```yaml
env:
  VITE_STELLAR_NETWORK: testnet
  VITE_HORIZON_URL: https://horizon-testnet.stellar.org
  VITE_SOROBAN_RPC_URL: https://soroban-testnet.stellar.org
  VITE_NETWORK_PASSPHRASE: "Test SDF Network ; September 2015"
```

### Secrets Required

- `VITE_RECORD_REGISTRY_CONTRACT_ID`
- `VITE_ACCESS_CONTROL_CONTRACT_ID`
- `VITE_PINATA_JWT` (optional)

### Output

- ✓ Green badge if all steps pass
- ✗ Red badge if any step fails
- Build artifacts uploaded to GitHub

## CD Job: Deploy to Vercel

Runs **only** after CI succeeds, **only** on push to main branch, **not** on pull requests.

### Conditions

```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

This ensures:
- CD only runs on main branch (not feature branches)
- CD only runs on push events (not pull requests)
- CD only runs after CI succeeds (via `needs: ci`)

### Steps

1. **Checkout code** - Get the repository code
2. **Setup Node.js** - Install Node.js 20 with npm cache
3. **Install dependencies** - `npm ci`
4. **Build for production** - `npm run build`
5. **Install Vercel CLI** - `npm install -g vercel`
6. **Deploy** - `vercel --prod --token=$VERCEL_TOKEN --confirm`
7. **Deployment summary** - Show success message with link
8. **Error handling** - Clear error message if deployment fails

### Secrets Required

- `VERCEL_TOKEN` - Your Vercel authentication token
- `VERCEL_ORG_ID` - Your Vercel organization ID
- `VERCEL_PROJECT_ID` - Your CareVault project ID
- `VITE_RECORD_REGISTRY_CONTRACT_ID` - Soroban contract ID
- `VITE_ACCESS_CONTROL_CONTRACT_ID` - Soroban contract ID
- `VITE_PINATA_JWT` (optional) - Pinata IPFS JWT

### Output

On success:
```
✓ Frontend successfully deployed to Vercel
✓ Visit: https://care-vault-q6sd.vercel.app
```

On failure:
```
✗ Vercel deployment failed
Check VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID secrets
```

## Configuring GitHub Secrets

### Step 1: Get Vercel Credentials

1. Go to https://vercel.com/account/tokens
2. Create a new token (e.g., "CareVault CI/CD")
3. Copy the token

### Step 2: Get Vercel Project Info

```bash
cd frontend
vercel link
# This creates .vercel/project.json with:
# - VERCEL_ORG_ID
# - VERCEL_PROJECT_ID
```

Or get them from Vercel dashboard:
- Organization ID: Settings → Organization → ID
- Project ID: Settings → General → Project ID

### Step 3: Set GitHub Secrets

1. Go to https://github.com/ashakumbhar08/CareVault/settings/secrets/actions
2. Add the following secrets:

| Secret Name | Value | Source |
|---|---|---|
| `VERCEL_TOKEN` | Your token | Vercel account tokens |
| `VERCEL_ORG_ID` | Organization ID | Vercel dashboard or `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Project ID | Vercel dashboard or `.vercel/project.json` |
| `VITE_RECORD_REGISTRY_CONTRACT_ID` | `CAFK4PGOJBX4WP3K33EGBQQA7K2Z25R2U4ZFC4S4AVCCDK3ASKPV7BNE` | Deployed contract |
| `VITE_ACCESS_CONTROL_CONTRACT_ID` | `CAVNZFTBKFRXNLAVI4IAT45GTJBSLJZZYX3GIXMY6Q3J7WPLNJSS43SK` | Deployed contract |
| `VITE_PINATA_JWT` | Your JWT | Pinata dashboard (optional) |

## Running Workflows Manually

### Trigger CI

```bash
git push origin main
```

This will:
1. Trigger CI job
2. Run all tests and build
3. Show results in GitHub Actions tab

### Check CI Status

Visit: https://github.com/ashakumbhar08/CareVault/actions

Click on the latest workflow run to see:
- All CI steps and their status
- Build logs
- Test output
- Whether CD was triggered

## Monitoring Deployment

### Badge Status

The README shows real-time pipeline status:
- 🟢 Green: All tests pass, deployment successful
- 🔴 Red: Tests failed, deployment did not run

### Live Deployment

After successful CD run:
- Application live at: https://care-vault-q6sd.vercel.app
- Check Vercel dashboard for deployment history
- View logs at: https://vercel.com/dashboard/projects

## Troubleshooting

### CI Fails: Type Check Error

**Error**: `error TS2345: ...`

**Solution**:
```bash
cd frontend
npm run type-check
# Fix issues locally, then push again
```

### CI Fails: Tests Fail

**Error**: `FAIL src/components/...`

**Solution**:
```bash
cd frontend
npm run test:run
# Fix failing tests, then push again
```

### CI Fails: Build Error

**Error**: `error during build: ...`

**Solution**:
```bash
cd frontend
npm run build
# Check for missing env vars or import errors
```

### CD Fails: Deployment Error

**Error**: `Error: Cannot find module 'vercel'`

**Cause**: Vercel credentials not configured

**Solution**: Set GitHub secrets (see "Configuring GitHub Secrets")

### CD Fails: "No such file or directory"

**Cause**: Build failed before CD started

**Check**: Look at CI job logs for build errors

### CD Fails: "Invalid token"

**Cause**: `VERCEL_TOKEN` is wrong or expired

**Solution**:
1. Generate new token from https://vercel.com/account/tokens
2. Update `VERCEL_TOKEN` secret in GitHub

## Performance

### Cache Strategy

- npm dependencies cached between runs
- Node modules only reinstalled if package-lock.json changes
- Reduces CI time by ~2 minutes

### Build Times

- Type check: ~5 seconds
- Tests: ~8 seconds
- Build: ~15 seconds
- Total CI: ~30 seconds
- Deploy: ~10 seconds

## Environment Variables

### Frontend Build Variables

These are set at the workflow level and used by Vite during build:

```
VITE_STELLAR_NETWORK=testnet
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
VITE_RECORD_REGISTRY_CONTRACT_ID=CAFK4...
VITE_ACCESS_CONTROL_CONTRACT_ID=CAVNZ...
```

These are embedded in the compiled bundle at build time and cannot be changed without rebuilding.

### Vercel Runtime Variables

These are set in Vercel project settings and used at runtime (optional):

```
VITE_PINATA_JWT=
```

These can be changed in Vercel dashboard without rebuilding.

## Workflow File Location

```
.github/workflows/frontend.yml
```

To update the pipeline, edit this file and push to GitHub. The new workflow will be used for the next push.

## Next Steps

1. ✅ Set all required GitHub secrets
2. ✅ Verify Vercel project is linked
3. ✅ Push a change to main
4. ✅ Watch GitHub Actions run
5. ✅ Check deployment status on Vercel
6. ✅ Visit live URL to confirm deployment

