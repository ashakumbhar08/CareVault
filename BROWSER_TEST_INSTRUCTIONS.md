# Browser Testing Instructions for CareVault Upload Flow

## Prerequisites
1. ✅ Dev server running at `http://localhost:3000` (currently running)
2. ✅ Freighter wallet extension installed in Chrome
3. ✅ Freighter wallet funded with testnet XLM (use https://laboratory.stellar.org/#account-creator?network=test if needed)
4. ✅ Chrome DevTools Console open (to view detailed logging)

## Current Status
- SDK upgraded from 13.3.0 → 16.0.1 ✅
- Transaction builders rewritten for SDK 16.x compatibility ✅
- Comprehensive logging added throughout the pipeline ✅
- Direct Node.js test confirms prepareTransaction() works ✅
- Types pass, tests pass (27/27) ✅

## Testing Protocol

### STEP 1: Upload Record Flow

1. **Open the application**
   - Navigate to `http://localhost:3000` in Chrome
   - Open DevTools (F12) and go to the Console tab

2. **Connect Freighter Wallet**
   - Click "Connect Wallet" button
   - Approve the connection in Freighter
   - Verify your wallet address appears in the UI
   - **Expected Console Output:**
     ```
     [WALLET] Connected successfully
     ```

3. **Upload a Record**
   - Click "Upload Record" button
   - Select a test file (any file, e.g., a text file or small image)
   - Choose a category (e.g., "Lab Report")
   - Click "Upload" button

4. **Monitor Console Output**
   You should see detailed step-by-step logging:

   ```
   [UPLOAD FLOW] ==================== START ====================
   [UPLOAD FLOW] File: test.txt Size: 1234 bytes
   [UPLOAD FLOW] Category: Lab Report
   [UPLOAD FLOW] Wallet: G...
   [UPLOAD FLOW] [1/4] Uploading to IPFS...
   [UPLOAD FLOW] ✓ IPFS upload complete, hash: Qm...
   [UPLOAD FLOW] [2/4] Building Soroban transaction...
   [UPLOAD TX] Starting transaction build
   [UPLOAD TX] [1/7] Loading account...
   [UPLOAD TX] ✓ Account loaded, sequence: 12345678
   [UPLOAD TX] [2/7] Creating contract...
   [UPLOAD TX] ✓ Contract created
   [UPLOAD TX] [3/7] Initializing TransactionBuilder...
   [UPLOAD TX] ✓ TransactionBuilder initialized
   [UPLOAD TX] [4/7] Encoding parameters...
   [UPLOAD TX] - IPFS hash bytes length: 46
   [UPLOAD TX] ✓ All 4 parameters encoded
   [UPLOAD TX] [5/7] Adding contract operation...
   [UPLOAD TX] ✓ Operation added
   [UPLOAD TX] [6/7] Building unsigned transaction...
   [UPLOAD TX] ✓ Unsigned transaction built, XDR length: 376
   [UPLOAD TX] [7/7] Calling prepareTransaction (simulates with RPC)...
   [UPLOAD TX] ✓ prepareTransaction succeeded!
   [UPLOAD TX] ✓ Prepared XDR length: 1064
   [UPLOAD TX] ✅ Transaction ready for Freighter signing
   [UPLOAD FLOW] ✓ Transaction built, ready for signing
   [UPLOAD FLOW] [3/4] Submitting transaction...
   [TX SUBMIT] Starting transaction submission
   [TX SUBMIT] [1/4] Requesting Freighter signature...
   ```

5. **Sign with Freighter**
   - Freighter popup should open (THIS WAS NOT HAPPENING BEFORE)
   - Review the transaction details
   - Click "Sign" in Freighter
   - **Expected Console Output:**
     ```
     [TX SUBMIT] ✓ Transaction signed by Freighter
     [TX SUBMIT] [2/4] Parsing signed transaction...
     [TX SUBMIT] ✓ Signed transaction parsed
     [TX SUBMIT] [3/4] Submitting to RPC server...
     [TX SUBMIT] ✓ Transaction submitted, hash: abc123...
     [TX SUBMIT] [4/4] Polling for confirmation...
     [TX SUBMIT] ✓ Transaction confirmed on-chain!
     [TX SUBMIT] ✅ SUCCESS - Hash: abc123...
     [UPLOAD FLOW] ✓ Transaction submitted and confirmed!
     [UPLOAD FLOW] Transaction hash: abc123...
     [UPLOAD FLOW] Explorer URL: https://stellar.expert/explorer/testnet/tx/abc123...
     [UPLOAD FLOW] ✅ SUCCESS - UPLOAD COMPLETE
     [UPLOAD FLOW] ==================== END ====================
     ```

6. **Verify Success**
   - Copy the transaction hash from the console
   - Open the Explorer URL in a new tab
   - Verify the transaction exists on Stellar Expert Testnet
   - **Record the transaction hash for reporting**

### STEP 2: Grant Access Flow

1. **Navigate to Access Control**
   - Click on "Access Control" or "Share Records" section

2. **Grant Access**
   - Enter a doctor's Stellar address (or use a second test account)
   - Select records to grant access to
   - Set expiration date
   - Click "Grant Access"

3. **Monitor Console for Similar Logging Pattern**
   - Transaction should build successfully
   - Freighter should open
   - Sign and submit
   - **Record the transaction hash**

### STEP 3: Revoke Access Flow

1. **View Active Grants**
   - Navigate to the grants list

2. **Revoke Access**
   - Click "Revoke" on an existing grant
   - Confirm the action

3. **Monitor Console**
   - Transaction should build, sign, and submit
   - **Record the transaction hash**

## What to Report Back

For each successful operation, provide:
1. ✅ **Upload Record Transaction Hash**: `___________________`
2. ✅ **Grant Access Transaction Hash**: `___________________`
3. ✅ **Revoke Access Transaction Hash**: `___________________`

## If Errors Occur

**Copy the FULL console output** showing:
- The exact step where it failed (e.g., "[UPLOAD TX] [4/7] Encoding parameters...")
- The complete error message
- Any error stack trace

## Common Issues and Solutions

### Issue: "Freighter not installed"
- **Solution**: Install Freighter extension from Chrome Web Store

### Issue: "Account not found"
- **Solution**: Fund your testnet account at https://laboratory.stellar.org/#account-creator?network=test

### Issue: Still seeing "Bad union switch: 1"
- **Cause**: SDK version mismatch
- **Solution**: Run `cd frontend && npm install` to ensure SDK 16.0.1 is installed
- **Verify**: Check `frontend/node_modules/@stellar/stellar-sdk/package.json` shows version 16.0.1

### Issue: IPFS upload fails
- **Solution**: Verify `VITE_PINATA_JWT` in `frontend/.env` is not empty

## After Testing

Once all three operations complete successfully with real transaction hashes:
1. All temporary console logging will be removed
2. The code will be finalized and ready for production
3. Vercel deployment can be fixed

## Current Dev Server

Process is running at: `http://localhost:3000`
Hot-reload is enabled, so any code changes will auto-refresh the browser.
