#!/usr/bin/env node

import * as StellarSdk from '@stellar/stellar-sdk';

const horizonUrl = 'https://horizon-testnet.stellar.org';
const sorobanRpcUrl = 'https://soroban-testnet.stellar.org';
const networkPassphrase = 'Test SDF Network ; September 2015';
const recordRegistryId = 'CAFK4PGOJBX4WP3K33EGBQQA7K2Z25R2U4ZFC4S4AVCCDK3ASKPV7BNE';

// Use the patient address that performed the upload
// You'll need to replace this with the actual wallet address used for upload
const TEST_PATIENT_ADDRESS = process.argv[2] || 'GCL6UFRGHFIXEDUVTCOWSJ3O5UQLH7CUPJKYBIL5K2YEJ32GFDU7U3ND';

console.log('\n=== Testing Read Records from Blockchain ===\n');
console.log('Patient Address:', TEST_PATIENT_ADDRESS);
console.log('Contract ID:', recordRegistryId);
console.log('');

async function readRecords(patientAddress) {
  try {
    console.log('[1/5] Creating RPC server connection...');
    const rpcServer = new StellarSdk.rpc.Server(sorobanRpcUrl);
    console.log('✓ RPC server created');

    console.log('[2/5] Creating contract instance...');
    const contract = new StellarSdk.Contract(recordRegistryId);
    console.log('✓ Contract instance created');

    console.log('[3/5] Encoding patient address to ScVal...');
    const patientScVal = StellarSdk.nativeToScVal(patientAddress, { type: 'address' });
    console.log('✓ Patient address encoded');

    console.log('[4/5] Calling contract.get_records()...');
    const operation = contract.call('get_records', patientScVal);
    
    // Build a read-only transaction to simulate the call
    const account = new StellarSdk.Account(patientAddress, '0');
    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: networkPassphrase,
    });
    
    txBuilder.addOperation(operation);
    txBuilder.setTimeout(30);
    const tx = txBuilder.build();
    
    console.log('Simulating read transaction...');
    const simResult = await rpcServer.simulateTransaction(tx);
    
    if (!simResult.result || !simResult.result.retval) {
      console.error('❌ Simulation failed or no result');
      console.log('Simulation result:', JSON.stringify(simResult, null, 2));
      return [];
    }
    
    console.log('✓ Simulation succeeded');
    
    console.log('[5/5] Decoding returned ScVal...');
    const resultValue = simResult.result.retval;
    
    // The result is a Vec<MedicalRecord>
    const scVal = resultValue;
    console.log('ScVal type:', scVal.switch().name);
    
    if (scVal.switch().name !== 'scvVec') {
      console.warn('⚠️  Expected Vec, got:', scVal.switch().name);
      return [];
    }
    
    const vec = scVal.vec();
    console.log('✓ Vector decoded, length:', vec?.length || 0);
    
    if (!vec || vec.length === 0) {
      console.log('\n📭 No records found for this patient\n');
      return [];
    }

    console.log('\n✅ Found', vec.length, 'record(s)!\n');
    console.log('Parsing records...\n');
    
    const records = [];
    
    for (let i = 0; i < vec.length; i++) {
      try {
        console.log(`--- Record ${i + 1}/${vec.length} ---`);
        const recordScVal = vec[i];
        
        if (recordScVal.switch().name !== 'scvMap') {
          console.warn(`Record ${i} is not a map, skipping`);
          continue;
        }
        
        const mapEntries = recordScVal.map();
        const recordObj = {};
        
        // Parse each field from the map
        mapEntries?.forEach((entry) => {
          const keyScVal = entry.key();
          const valScVal = entry.val();
          
          if (keyScVal.switch().name === 'scvSymbol') {
            const fieldName = keyScVal.sym().toString();
            
            switch (fieldName) {
              case 'record_id':
                recordObj.record_id = Number(StellarSdk.scValToNative(valScVal));
                break;
              case 'patient':
                recordObj.patient = StellarSdk.scValToNative(valScVal);
                break;
              case 'ipfs_hash':
                const bytesVal = valScVal.bytes();
                recordObj.ipfs_hash = new TextDecoder().decode(bytesVal);
                break;
              case 'category':
                recordObj.category = Number(StellarSdk.scValToNative(valScVal));
                break;
              case 'uploaded_at':
                recordObj.uploaded_at = Number(StellarSdk.scValToNative(valScVal));
                break;
              case 'file_size_kb':
                recordObj.file_size_kb = Number(StellarSdk.scValToNative(valScVal));
                break;
              case 'verification_status':
                recordObj.verification_status = Number(StellarSdk.scValToNative(valScVal));
                break;
              case 'is_active':
                recordObj.is_active = StellarSdk.scValToNative(valScVal);
                break;
            }
          }
        });
        
        console.log('Record ID:', recordObj.record_id);
        console.log('Patient:', recordObj.patient);
        console.log('IPFS Hash:', recordObj.ipfs_hash);
        console.log('Category:', recordObj.category);
        console.log('Uploaded At:', new Date(recordObj.uploaded_at * 1000).toISOString());
        console.log('File Size:', recordObj.file_size_kb, 'KB');
        console.log('Verification Status:', recordObj.verification_status);
        console.log('Is Active:', recordObj.is_active);
        console.log('');
        
        records.push(recordObj);
      } catch (parseErr) {
        console.error(`❌ Failed to parse record ${i}:`, parseErr);
      }
    }
    
    console.log('✅ Successfully parsed', records.length, 'record(s)\n');
    
    if (records.length > 0) {
      console.log('🔗 IPFS Gateway URLs:');
      records.forEach((r, i) => {
        console.log(`   ${i + 1}. https://gateway.pinata.cloud/ipfs/${r.ipfs_hash}`);
      });
      console.log('');
    }
    
    return records;
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.error('Stack trace:', error.stack);
    return [];
  }
}

readRecords(TEST_PATIENT_ADDRESS)
  .then((records) => {
    console.log('=== Test completed ===\n');
    if (records.length > 0) {
      console.log('✅ Read operation successful!');
      console.log('📊 Total records:', records.length);
    } else {
      console.log('ℹ️  No records found (this is OK if no uploads have been made)');
    }
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.log('=== Test failed ===\n');
    console.error(error);
    process.exit(1);
  });
