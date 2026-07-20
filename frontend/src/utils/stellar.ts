import * as freighter from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

const isDemoMode = () => new URLSearchParams(window.location.search).get('demo') === 'true';

const horizonUrl = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const sorobanRpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const networkPassphrase = import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const recordRegistryId = import.meta.env.VITE_RECORD_REGISTRY_CONTRACT_ID || '';
const accessControlId = import.meta.env.VITE_ACCESS_CONTROL_CONTRACT_ID || '';

const SOROBAN_BASE_FEE = '100';

export const getStellarServer = () => {
  return new StellarSdk.Horizon.Server(horizonUrl);
};

export const getSorobanRpc = () => {
  return new StellarSdk.rpc.Server(sorobanRpcUrl);
};

export const getNetworkConfig = () => {
  return {
    networkPassphrase,
    horizonUrl,
    sorobanRpcUrl,
    recordRegistryId,
    accessControlId,
  };
};

// Helper to load or create account (compatible with SDK 16.x)
const loadAccount = async (horizonServer: StellarSdk.Horizon.Server, address: string): Promise<StellarSdk.Account> => {
  try {
    const horizonAccount = await horizonServer.loadAccount(address);
    return new StellarSdk.Account(horizonAccount.accountId(), horizonAccount.sequenceNumber());
  } catch {
    return new StellarSdk.Account(address, '0');
  }
};

export const checkFreighterInstalled = async (): Promise<boolean> => {
  if (isDemoMode()) return true;
  const result = await freighter.isConnected();
  return result.isConnected;
};

export const connectWallet = async (): Promise<{ publicKey: string; network: string }> => {
  if (isDemoMode()) {
    return {
      publicKey: 'GDKWDEMO...P91M',
      network: 'testnet',
    };
  }

  const connectedResult = await freighter.isConnected();
  if (!connectedResult.isConnected) {
    throw new Error('Freighter wallet not installed');
  }

  const accessResult = await freighter.requestAccess();
  if (accessResult.error) {
    throw new Error(accessResult.error.message || 'Failed to request access');
  }

  const addressResult = await freighter.getAddress();
  if (addressResult.error) {
    throw new Error(addressResult.error.message || 'Failed to get address');
  }

  const networkDetails = await freighter.getNetwork();
  if (networkDetails.error) {
    throw new Error(networkDetails.error.message || 'Failed to get network');
  }

  return { publicKey: addressResult.address, network: networkDetails.network };
};

export const getWalletBalance = async (publicKey: string): Promise<string> => {
  if (isDemoMode()) return '100.0000000';

  try {
    const server = getStellarServer();
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(
      (balance: any) => balance.asset_type === 'native'
    ) as any;
    return xlmBalance?.balance || '0';
  } catch (error) {
    return '0';
  }
};

// FIXED: SDK 16.0.1 compatibility - prepareTransaction now works correctly
export const buildUploadRecordTx = async (params: {
  patientAddress: string;
  ipfsHash: string;
  category: number;
  fileSizeKb: number;
}): Promise<string> => {
  if (isDemoMode()) {
    return 'demo_xdr_' + Math.random().toString(36);
  }

  if (!recordRegistryId) {
    throw new Error('VITE_RECORD_REGISTRY_CONTRACT_ID is not configured');
  }

  console.log('[UPLOAD TX] Starting transaction build');
  console.log('[UPLOAD TX] Params:', {
    patient: params.patientAddress,
    ipfsHash: params.ipfsHash.substring(0, 20) + '...',
    category: params.category,
    fileSizeKb: params.fileSizeKb,
  });

  try {
    const horizonServer = getStellarServer();
    const rpcServer = getSorobanRpc();

    // Step 1: Load account from Horizon server
    console.log('[UPLOAD TX] [1/7] Loading account...');
    const account = await loadAccount(horizonServer, params.patientAddress);
    console.log('[UPLOAD TX] ✓ Account loaded, sequence:', account.sequenceNumber());

    // Step 2: Create contract instance
    console.log('[UPLOAD TX] [2/7] Creating contract...');
    const contract = new StellarSdk.Contract(recordRegistryId);
    console.log('[UPLOAD TX] ✓ Contract created');

    // Step 3: Build transaction builder
    console.log('[UPLOAD TX] [3/7] Initializing TransactionBuilder...');
    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: SOROBAN_BASE_FEE,
      networkPassphrase: networkPassphrase,
    });
    console.log('[UPLOAD TX] ✓ TransactionBuilder initialized');

    // Step 4: Encode parameters
    console.log('[UPLOAD TX] [4/7] Encoding parameters...');
    const hashBytes = new TextEncoder().encode(params.ipfsHash);
    console.log('[UPLOAD TX] - IPFS hash bytes length:', hashBytes.length);
    const args = [
      StellarSdk.nativeToScVal(params.patientAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(hashBytes, { type: 'bytes' }),
      StellarSdk.nativeToScVal(params.category, { type: 'u32' }),
      StellarSdk.nativeToScVal(params.fileSizeKb, { type: 'u32' }),
    ];
    console.log('[UPLOAD TX] ✓ All 4 parameters encoded');

    // Step 5: Add operation
    console.log('[UPLOAD TX] [5/7] Adding contract operation...');
    txBuilder.addOperation(contract.call('upload_record', ...args));
    console.log('[UPLOAD TX] ✓ Operation added');

    // Step 6: Set timeout and build
    console.log('[UPLOAD TX] [6/7] Building unsigned transaction...');
    txBuilder.setTimeout(30);
    const unsignedTransaction = txBuilder.build();
    console.log('[UPLOAD TX] ✓ Unsigned transaction built, XDR length:', unsignedTransaction.toXDR().length);

    // Step 7: Prepare transaction
    console.log('[UPLOAD TX] [7/7] Calling prepareTransaction (simulates with RPC)...');
    const preparedTransaction = await rpcServer.prepareTransaction(unsignedTransaction);
    console.log('[UPLOAD TX] ✓ prepareTransaction succeeded!');
    console.log('[UPLOAD TX] ✓ Prepared XDR length:', preparedTransaction.toXDR().length);
    console.log('[UPLOAD TX] ✅ Transaction ready for Freighter signing');

    return preparedTransaction.toXDR();
  } catch (error) {
    console.error('[UPLOAD TX] ❌ FAILED at step:', error);
    console.error('[UPLOAD TX] Error details:', error instanceof Error ? error.stack : String(error));
    throw new Error(
      `Upload record transaction build failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const buildGrantAccessTx = async (params: {
  patientAddress: string;
  doctorAddress: string;
  recordIds: number[];
  expiresAt: number;
}): Promise<string> => {
  if (isDemoMode()) {
    return 'demo_xdr_' + Math.random().toString(36);
  }

  if (!accessControlId) {
    throw new Error('VITE_ACCESS_CONTROL_CONTRACT_ID is not configured');
  }

  try {
    const horizonServer = getStellarServer();
    const rpcServer = getSorobanRpc();

    const account = await loadAccount(horizonServer, params.patientAddress);
    const contract = new StellarSdk.Contract(accessControlId);

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: SOROBAN_BASE_FEE,
      networkPassphrase: networkPassphrase,
    });

    const recordIdsScVal = params.recordIds.map(id =>
      StellarSdk.nativeToScVal(id, { type: 'u64' })
    );

    const args = [
      StellarSdk.nativeToScVal(params.patientAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(params.doctorAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(recordIdsScVal, { type: 'vec' as any }),
      StellarSdk.nativeToScVal(params.expiresAt, { type: 'u64' }),
    ];

    txBuilder.addOperation(contract.call('grant_access', ...args));
    txBuilder.setTimeout(30);
    const unsignedTransaction = txBuilder.build();

    const preparedTransaction = await rpcServer.prepareTransaction(unsignedTransaction);

    return preparedTransaction.toXDR();
  } catch (error) {
    throw new Error(
      `Grant access transaction build failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const buildRevokeAccessTx = async (params: {
  patientAddress: string;
  grantId: number;
}): Promise<string> => {
  if (isDemoMode()) {
    return 'demo_xdr_' + Math.random().toString(36);
  }

  if (!accessControlId) {
    throw new Error('VITE_ACCESS_CONTROL_CONTRACT_ID is not configured');
  }

  try {
    const horizonServer = getStellarServer();
    const rpcServer = getSorobanRpc();

    const account = await loadAccount(horizonServer, params.patientAddress);
    const contract = new StellarSdk.Contract(accessControlId);

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: SOROBAN_BASE_FEE,
      networkPassphrase: networkPassphrase,
    });

    const args = [
      StellarSdk.nativeToScVal(params.patientAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(params.grantId, { type: 'u64' }),
    ];

    txBuilder.addOperation(contract.call('revoke_access', ...args));
    txBuilder.setTimeout(30);
    const unsignedTransaction = txBuilder.build();

    const preparedTransaction = await rpcServer.prepareTransaction(unsignedTransaction);

    return preparedTransaction.toXDR();
  } catch (error) {
    throw new Error(
      `Revoke access transaction build failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const submitTransaction = async (xdr: string): Promise<{ hash: string; explorerUrl: string }> => {
  console.log('[TX SUBMIT] Starting transaction submission');
  console.log('[TX SUBMIT] XDR length:', xdr.length);
  
  if (isDemoMode()) {
    const hash = 'demo_tx_' + Math.random().toString(36).substring(7);
    return {
      hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    };
  }

  const rpcServer = getSorobanRpc();

  try {
    console.log('[TX SUBMIT] [1/4] Requesting Freighter signature...');
    const signResult = await freighter.signTransaction(xdr, {
      networkPassphrase,
    });

    if (signResult.error) {
      console.error('[TX SUBMIT] ❌ Freighter signing failed:', signResult.error.message);
      throw new Error(`Freighter signing failed: ${signResult.error.message}`);
    }

    if (!signResult.signedTxXdr) {
      console.error('[TX SUBMIT] ❌ No signed XDR returned from Freighter');
      throw new Error('Freighter did not return a signed transaction');
    }

    console.log('[TX SUBMIT] ✓ Transaction signed by Freighter');
    console.log('[TX SUBMIT] [2/4] Parsing signed transaction...');

    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signResult.signedTxXdr,
      networkPassphrase
    );
    console.log('[TX SUBMIT] ✓ Signed transaction parsed');

    console.log('[TX SUBMIT] [3/4] Submitting to RPC server...');
    const submitResult = await rpcServer.sendTransaction(signedTx);

    if (submitResult.status === 'ERROR') {
      const errorDetail = submitResult.errorResult || 'Unknown error';
      console.error('[TX SUBMIT] ❌ RPC rejected transaction:', errorDetail);
      throw new Error(`RPC rejected transaction: ${errorDetail}`);
    }

    const txHash = submitResult.hash;
    console.log('[TX SUBMIT] ✓ Transaction submitted, hash:', txHash);

    // Poll for confirmation
    console.log('[TX SUBMIT] [4/4] Polling for confirmation...');
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!confirmed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
        const txStatus = await rpcServer.getTransaction(txHash);

        if (txStatus.status === 'SUCCESS') {
          confirmed = true;
          console.log('[TX SUBMIT] ✓ Transaction confirmed on-chain!');
          console.log('[TX SUBMIT] ✅ SUCCESS - Hash:', txHash);
          return {
            hash: txHash,
            explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
          };
        }

        if (txStatus.status === 'FAILED') {
          console.error('[TX SUBMIT] ❌ Transaction failed on-chain');
          throw new Error(`Transaction failed on-chain`);
        }
        
        console.log(`[TX SUBMIT] Polling attempt ${attempts + 1}/${maxAttempts}, status: ${txStatus.status}`);
      } catch (pollErr) {
        // Continue polling
        console.log(`[TX SUBMIT] Poll attempt ${attempts + 1} - transaction not yet available`);
      }

      attempts++;
    }

    console.log('[TX SUBMIT] ⚠️  Polling timed out, returning hash anyway:', txHash);
    return {
      hash: txHash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
    };
  } catch (error) {
    console.error('[TX SUBMIT] ❌ SUBMISSION FAILED:', error);
    console.error('[TX SUBMIT] Error details:', error instanceof Error ? error.stack : String(error));
    throw new Error(
      `Transaction submission failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export interface MedicalRecord {
  record_id: number;
  patient: string;
  ipfs_hash: string;
  category: number;
  uploaded_at: number;
  file_size_kb: number;
  verification_status: number;
  is_active: boolean;
}

export interface AccessGrant {
  grant_id: number;
  patient: string;
  doctor: string;
  record_ids: number[];
  granted_at: number;
  expires_at: number;
  is_active: boolean;
}

export const readRecords = async (patientAddress: string): Promise<MedicalRecord[]> => {
  console.log('[READ RECORDS] ==================== START ====================');
  console.log('[READ RECORDS] Patient address:', patientAddress);
  console.log('[READ RECORDS] Contract ID:', recordRegistryId);
  
  if (isDemoMode()) {
    console.log('[READ RECORDS] Demo mode - returning empty array');
    return [];
  }

  if (!recordRegistryId) {
    console.error('[READ RECORDS] ❌ Record Registry Contract ID not configured');
    throw new Error('VITE_RECORD_REGISTRY_CONTRACT_ID is not configured');
  }

  try {
    console.log('[READ RECORDS] [1/5] Creating RPC server connection...');
    const rpcServer = getSorobanRpc();
    console.log('[READ RECORDS] ✓ RPC server created');

    console.log('[READ RECORDS] [2/5] Creating contract instance...');
    const contract = new StellarSdk.Contract(recordRegistryId);
    console.log('[READ RECORDS] ✓ Contract instance created');

    console.log('[READ RECORDS] [3/5] Encoding patient address to ScVal...');
    const patientScVal = StellarSdk.nativeToScVal(patientAddress, { type: 'address' });
    console.log('[READ RECORDS] ✓ Patient address encoded');

    console.log('[READ RECORDS] [4/5] Calling contract.get_records()...');
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
    
    console.log('[READ RECORDS] Simulating read transaction...');
    const simResult = await rpcServer.simulateTransaction(tx);
    
    console.log('[READ RECORDS] Simulation result:', simResult);
    
    // SDK 16.x: Check for result using type guard
    const successResult = simResult as any;
    if (!successResult.result || !successResult.result.retval) {
      console.error('[READ RECORDS] ❌ Simulation failed or no result:', simResult);
      return [];
    }
    
    const resultValue = successResult.result.retval;

    console.log('[READ RECORDS] [5/5] Decoding returned ScVal...');
    console.log('[READ RECORDS] Raw result XDR:', resultValue);
    
    // The result is a Vec<MedicalRecord>
    const scVal = resultValue;
    console.log('[READ RECORDS] ScVal type:', scVal.switch().name);
    
    if (scVal.switch().name !== 'scvVec') {
      console.warn('[READ RECORDS] ⚠️  Expected Vec, got:', scVal.switch().name);
      return [];
    }
    
    const vec = scVal.vec();
    console.log('[READ RECORDS] ✓ Vector decoded, length:', vec?.length || 0);
    
    if (!vec || vec.length === 0) {
      console.log('[READ RECORDS] No records found for patient');
      console.log('[READ RECORDS] ==================== END (EMPTY) ====================');
      return [];
    }

    console.log('[READ RECORDS] Parsing', vec.length, 'records...');
    const records: MedicalRecord[] = [];
    
    for (let i = 0; i < vec.length; i++) {
      try {
        console.log(`[READ RECORDS] Parsing record ${i + 1}/${vec.length}...`);
        const recordScVal = vec[i];
        
        // Each record is a struct (Map in ScVal)
        if (recordScVal.switch().name !== 'scvMap') {
          console.warn(`[READ RECORDS] Record ${i} is not a map, skipping`);
          continue;
        }
        
        const mapEntries = recordScVal.map();
        const recordObj: any = {};
        
        // Parse each field from the map
        mapEntries?.forEach((entry: any) => {
          const keyScVal = entry.key();
          const valScVal = entry.val();
          
          // Key is a Symbol
          if (keyScVal.switch().name === 'scvSymbol') {
            const fieldName = keyScVal.sym().toString();
            
            // Decode value based on field name
            switch (fieldName) {
              case 'record_id':
                recordObj.record_id = Number(StellarSdk.scValToNative(valScVal));
                break;
              case 'patient':
                recordObj.patient = StellarSdk.scValToNative(valScVal);
                break;
              case 'ipfs_hash':
                // ipfs_hash is Bytes, need to decode to string
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
        
        console.log(`[READ RECORDS] ✓ Record ${i + 1} parsed:`, {
          record_id: recordObj.record_id,
          ipfs_hash: recordObj.ipfs_hash?.substring(0, 20) + '...',
          category: recordObj.category,
          is_active: recordObj.is_active,
        });
        
        records.push(recordObj as MedicalRecord);
      } catch (parseErr) {
        console.error(`[READ RECORDS] ❌ Failed to parse record ${i}:`, parseErr);
      }
    }
    
    console.log('[READ RECORDS] ✅ Successfully parsed', records.length, 'records');
    console.log('[READ RECORDS] ==================== END (SUCCESS) ====================');
    return records;
    
  } catch (error) {
    console.error('[READ RECORDS] ❌ FAILED:', error);
    console.error('[READ RECORDS] Error details:', error instanceof Error ? error.stack : String(error));
    console.log('[READ RECORDS] ==================== END (FAILED) ====================');
    return [];
  }
};

export const readActiveGrants = async (_patientAddress: string): Promise<AccessGrant[]> => {
  if (isDemoMode()) {
    return [];
  }

  try {
    return [];
  } catch (error) {
    console.error('Error reading active grants:', error);
    return [];
  }
};

export const readDoctorGrants = async (_doctorAddress: string): Promise<AccessGrant[]> => {
  if (isDemoMode()) {
    return [];
  }

  try {
    return [];
  } catch (error) {
    console.error('Error reading doctor grants:', error);
    return [];
  }
};

export const checkAccess = async (_doctorAddress: string, _patientAddress: string): Promise<boolean> => {
  if (isDemoMode()) {
    return false;
  }

  try {
    return false;
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
};

export const getAccountBalance = async (publicKey: string): Promise<string> => {
  return getWalletBalance(publicKey);
};
