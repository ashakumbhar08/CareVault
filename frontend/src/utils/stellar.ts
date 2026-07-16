/*
========================================
PRODUCTION RECOVERY - ROOT CAUSES & FIXES
========================================

ROOT CAUSE 1: "Record Registry Contract ID not configured" error
- Problem: recordRegistryId was reading from import.meta.env.VITE_RECORD_REGISTRY_CONTRACT_ID
- The env var was in .env.testnet but NOT in frontend/.env
- Solution: Created frontend/.env with all contract IDs as fallback

ROOT CAUSE 2: No Freighter popup / No Soroban transaction
- Problem: buildUploadRecordTx(), buildGrantAccessTx(), buildRevokeAccessTx() were building dummy transactions
- Solution: Rewrote all three functions to properly build Soroban contract invocations
  - Use new StellarSdk.Contract(contractId)
  - Use contract.call(functionName, ...args) to create invoke operations
  - Use sorobanServer.simulateTransaction() to simulate before signing
  - Use nativeToScVal() to convert JavaScript values to Soroban values

ROOT CAUSE 3: GrantAccessModal & RevokeAccessModal calling buildTx directly
- Problem: Modals were not using the useAccessGrants hook
- Solution: Updated both modals to use grantAccess() and revokeAccess() hooks

ROOT CAUSE 4: Vercel deployment pipeline broken
- Solution: GitHub Actions workflow now includes deploy step with environment variables
*/

import * as freighter from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';
import { assembleTransaction } from '@stellar/stellar-sdk/rpc';

const isDemoMode = () => new URLSearchParams(window.location.search).get('demo') === 'true';

const horizonUrl = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const sorobanRpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const networkPassphrase = import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const recordRegistryId = import.meta.env.VITE_RECORD_REGISTRY_CONTRACT_ID || '';
const accessControlId = import.meta.env.VITE_ACCESS_CONTROL_CONTRACT_ID || '';

// BASE_FEE multiplier for Soroban transactions
const SOROBAN_FEE_MULTIPLIER = '100';

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
    throw new Error(
      'VITE_RECORD_REGISTRY_CONTRACT_ID is undefined. Build mode: ' +
      import.meta.env.MODE +
      '. Check frontend/.env.testnet and build script.'
    );
  }

  try {
    const horizonServer = getStellarServer();
    const sorobanServer = getSorobanRpc();
    const account = await horizonServer.loadAccount(params.patientAddress);

    const contract = new StellarSdk.Contract(recordRegistryId);

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: SOROBAN_FEE_MULTIPLIER,
      networkPassphrase,
    });

    // Convert IPFS hash string to bytes ScVal
    const hashBytes = new TextEncoder().encode(params.ipfsHash);
    console.log('[DEBUG] hashBytes length:', hashBytes.length, 'type:', typeof hashBytes);
    const hashScVal = StellarSdk.xdr.ScVal.scvBytes(hashBytes);
    console.log('[DEBUG] hashScVal created');

    // Create Address object from string (not passing raw string to nativeToScVal)
    const patientAddr = StellarSdk.Address.fromString(params.patientAddress);
    console.log('[DEBUG] patientAddr created from string');
    const patientScVal = StellarSdk.nativeToScVal(patientAddr, { type: 'address' });
    console.log('[DEBUG] patientScVal created');
    const categoryScVal = StellarSdk.nativeToScVal(params.category, { type: 'u32' });
    console.log('[DEBUG] categoryScVal created for:', params.category);
    const fileSizeScVal = StellarSdk.nativeToScVal(params.fileSizeKb, { type: 'u32' });
    console.log('[DEBUG] fileSizeScVal created for:', params.fileSizeKb);

    console.log('[DEBUG] calling contract.call...');
    txBuilder.addOperation(
      contract.call(
        'upload_record',
        patientScVal,
        hashScVal,
        categoryScVal,
        fileSizeScVal
      )
    );
    console.log('[DEBUG] contract.call completed');

    const transaction = txBuilder.setTimeout(30).build();
    console.log('[DEBUG] transaction built');
    const simResult = await sorobanServer.simulateTransaction(transaction);
    console.log('[DEBUG] simulation result:', (simResult as any).error ? 'ERROR' : 'SUCCESS');

    if ((simResult as any).error) {
      throw new Error('Simulation failed: ' + JSON.stringify((simResult as any).error));
    }

    // Assemble the transaction with simulation results
    const assembled = assembleTransaction(transaction, simResult as any);
    const finalTransaction = assembled.build();

    return finalTransaction.toXDR();
  } catch (error) {
    throw new Error(
      `Upload record tx build failed: ${error instanceof Error ? error.message : String(error)}`
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
    throw new Error(
      'VITE_ACCESS_CONTROL_CONTRACT_ID is undefined. Build mode: ' +
      import.meta.env.MODE +
      '. Check frontend/.env.testnet and build script.'
    );
  }

  try {
    const horizonServer = getStellarServer();
    const sorobanServer = getSorobanRpc();
    const account = await horizonServer.loadAccount(params.patientAddress);

    const contract = new StellarSdk.Contract(accessControlId);

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: SOROBAN_FEE_MULTIPLIER,
      networkPassphrase,
    });

    // Convert record IDs array to Soroban Vec<u64>
    const recordIdsScVal = params.recordIds.map(id =>
      StellarSdk.nativeToScVal(id, { type: 'u64' })
    );

    txBuilder.addOperation(
      contract.call(
        'grant_access',
        StellarSdk.nativeToScVal(params.patientAddress, { type: 'address' }),
        StellarSdk.nativeToScVal(params.doctorAddress, { type: 'address' }),
        StellarSdk.nativeToScVal(recordIdsScVal, { type: 'vec' }),
        StellarSdk.nativeToScVal(params.expiresAt, { type: 'u64' })
      )
    );

    const transaction = txBuilder.setTimeout(30).build();
    const simResult = await sorobanServer.simulateTransaction(transaction);

    if ((simResult as any).error) {
      throw new Error('Simulation failed: ' + JSON.stringify((simResult as any).error));
    }

    // Assemble the transaction with simulation results
    const assembled = assembleTransaction(transaction, simResult as any);
    const finalTransaction = assembled.build();

    return finalTransaction.toXDR();
  } catch (error) {
    throw new Error(
      `Grant access tx build failed: ${error instanceof Error ? error.message : String(error)}`
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
    throw new Error(
      'VITE_ACCESS_CONTROL_CONTRACT_ID is undefined. Build mode: ' +
      import.meta.env.MODE +
      '. Check frontend/.env.testnet and build script.'
    );
  }

  try {
    const horizonServer = getStellarServer();
    const sorobanServer = getSorobanRpc();
    const account = await horizonServer.loadAccount(params.patientAddress);

    const contract = new StellarSdk.Contract(accessControlId);

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: SOROBAN_FEE_MULTIPLIER,
      networkPassphrase,
    });

    txBuilder.addOperation(
      contract.call(
        'revoke_access',
        StellarSdk.nativeToScVal(params.patientAddress, { type: 'address' }),
        StellarSdk.nativeToScVal(params.grantId, { type: 'u64' })
      )
    );

    const transaction = txBuilder.setTimeout(30).build();
    const simResult = await sorobanServer.simulateTransaction(transaction);

    if ((simResult as any).error) {
      throw new Error('Simulation failed: ' + JSON.stringify((simResult as any).error));
    }

    // Assemble the transaction with simulation results
    const assembled = assembleTransaction(transaction, simResult as any);
    const finalTransaction = assembled.build();

    return finalTransaction.toXDR();
  } catch (error) {
    throw new Error(
      `Revoke access tx build failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const submitTransaction = async (xdr: string): Promise<{ hash: string; explorerUrl: string }> => {
  if (isDemoMode()) {
    const hash = 'demo_tx_' + Math.random().toString(36).substring(7);
    return {
      hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    };
  }

  try {
    const signedXdrResponse = await freighter.signTransaction(xdr, {
      networkPassphrase,
    });

    if (signedXdrResponse.error) {
      throw new Error(
        `Freighter signature rejected: ${signedXdrResponse.error.message || 'Unknown error'}`
      );
    }

    if (!signedXdrResponse.signedTxXdr) {
      throw new Error('No signed transaction XDR returned from Freighter');
    }

    const sorobanServer = getSorobanRpc();
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXdrResponse.signedTxXdr,
      networkPassphrase
    );

    const sendResult = await sorobanServer.sendTransaction(transaction);

    if (sendResult.status === 'ERROR') {
      throw new Error(`Transaction submission error`);
    }

    let pollCount = 0;
    const maxPolls = 20;
    let finalStatus = 'PENDING';

    while (pollCount < maxPolls && finalStatus === 'PENDING') {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const statusResult = await sorobanServer.getTransaction(sendResult.hash);
      finalStatus = statusResult.status;

      if (finalStatus === 'SUCCESS') {
        return {
          hash: sendResult.hash,
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${sendResult.hash}`,
        };
      } else if (finalStatus === 'FAILED') {
        throw new Error(`Transaction failed`);
      }

      pollCount++;
    }

    return {
      hash: sendResult.hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${sendResult.hash}`,
    };
  } catch (error) {
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

export const readRecords = async (_patientAddress: string): Promise<MedicalRecord[]> => {
  if (isDemoMode()) {
    return [];
  }

  try {
    return [];
  } catch (error) {
    console.error('Error reading records:', error);
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
