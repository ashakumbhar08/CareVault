#!/usr/bin/env node

import * as StellarSdk from '@stellar/stellar-sdk';

const horizonUrl = 'https://horizon-testnet.stellar.org';
const sorobanRpcUrl = 'https://soroban-testnet.stellar.org';
const networkPassphrase = 'Test SDF Network ; September 2015';
const recordRegistryId = 'CAFK4PGOJBX4WP3K33EGBQQA7K2Z25R2U4ZFC4S4AVCCDK3ASKPV7BNE';

const SOROBAN_BASE_FEE = '100';

// Use a properly formatted testnet account address for testing
const TEST_PATIENT_ADDRESS = 'GCL6UFRGHFIXEDUVTCOWSJ3O5UQLH7CUPJKYBIL5K2YEJ32GFDU7U3ND';

console.log('\n=== Testing Upload Record Transaction Builder ===\n');

async function loadAccount(horizonServer, address) {
  try {
    console.log(`[1] Loading account from Horizon: ${address}`);
    const horizonAccount = await horizonServer.loadAccount(address);
    console.log(`    ✓ Account loaded, sequence: ${horizonAccount.sequenceNumber()}`);
    return new StellarSdk.Account(horizonAccount.accountId(), horizonAccount.sequenceNumber());
  } catch (error) {
    console.log(`    ✗ Account load failed: ${error.message}`);
    console.log(`    → Creating mock account with sequence 0`);
    return new StellarSdk.Account(address, '0');
  }
}

async function buildUploadRecordTx(params) {
  try {
    const horizonServer = new StellarSdk.Horizon.Server(horizonUrl);
    const rpcServer = new StellarSdk.rpc.Server(sorobanRpcUrl);

    // Step 1: Load account
    const account = await loadAccount(horizonServer, params.patientAddress);

    // Step 2: Create contract instance
    console.log(`[2] Creating contract instance: ${recordRegistryId}`);
    const contract = new StellarSdk.Contract(recordRegistryId);
    console.log(`    ✓ Contract created`);

    // Step 3: Build transaction builder
    console.log(`[3] Initializing TransactionBuilder`);
    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: SOROBAN_BASE_FEE,
      networkPassphrase: networkPassphrase,
    });
    console.log(`    ✓ TransactionBuilder initialized`);

    // Step 4: Encode parameters
    console.log(`[4] Encoding parameters:`);
    console.log(`    - patientAddress: ${params.patientAddress}`);
    console.log(`    - ipfsHash: ${params.ipfsHash}`);
    console.log(`    - category: ${params.category}`);
    console.log(`    - fileSizeKb: ${params.fileSizeKb}`);

    const hashBytes = new TextEncoder().encode(params.ipfsHash);
    console.log(`    - ipfsHash as bytes (length: ${hashBytes.length})`);

    const args = [
      StellarSdk.nativeToScVal(params.patientAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(hashBytes, { type: 'bytes' }),
      StellarSdk.nativeToScVal(params.category, { type: 'u32' }),
      StellarSdk.nativeToScVal(params.fileSizeKb, { type: 'u32' }),
    ];
    console.log(`    ✓ All 4 parameters encoded to ScVal`);

    // Step 5: Add operation
    console.log(`[5] Adding contract.call('upload_record', ...args) operation`);
    txBuilder.addOperation(contract.call('upload_record', ...args));
    console.log(`    ✓ Operation added`);

    // Step 6: Set timeout and build
    console.log(`[6] Setting timeout and building unsigned transaction`);
    txBuilder.setTimeout(30);
    const unsignedTransaction = txBuilder.build();
    console.log(`    ✓ Unsigned transaction built`);
    console.log(`    - XDR length: ${unsignedTransaction.toXDR().length} chars`);

    // Step 7: Prepare transaction (THIS IS WHERE "Bad union switch" WAS FAILING)
    console.log(`[7] Calling rpcServer.prepareTransaction()...`);
    console.log(`    (This simulates the transaction with the RPC server)`);
    
    const preparedTransaction = await rpcServer.prepareTransaction(unsignedTransaction);
    
    console.log(`    ✓ prepareTransaction() succeeded!`);
    console.log(`    - Prepared XDR length: ${preparedTransaction.toXDR().length} chars`);

    const xdr = preparedTransaction.toXDR();
    
    console.log('\n✅ SUCCESS: Transaction built and prepared without errors!\n');
    console.log(`Final XDR (first 100 chars): ${xdr.substring(0, 100)}...\n`);
    
    return xdr;
  } catch (error) {
    console.log(`\n❌ FAILURE at step: ${error.message}\n`);
    console.log(`Stack trace:`);
    console.log(error.stack);
    throw error;
  }
}

// Test with realistic parameters
const testParams = {
  patientAddress: TEST_PATIENT_ADDRESS,
  ipfsHash: 'QmTest1234567890abcdefghijklmnopqrstuvwxyz123456',
  category: 1,
  fileSizeKb: 256,
};

buildUploadRecordTx(testParams)
  .then(() => {
    console.log('=== Test completed successfully ===\n');
    process.exit(0);
  })
  .catch((error) => {
    console.log('=== Test failed ===\n');
    process.exit(1);
  });
