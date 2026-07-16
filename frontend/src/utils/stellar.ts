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

  try {
    const horizonServer = getStellarServer();
    const rpcServer = getSorobanRpc();

    // Step 1: Load account from Horizon server
    const account = await loadAccount(horizonServer, params.patientAddress);

    // Step 2: Create contract instance
    const contract = new StellarSdk.Contract(recordRegistryId);

    // Step 3: Build transaction builder
    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: SOROBAN_BASE_FEE,
      networkPassphrase: networkPassphrase,
    });

    // Step 4: Encode parameters
    const hashBytes = new TextEncoder().encode(params.ipfsHash);
    const args = [
      StellarSdk.nativeToScVal(params.patientAddress, { type: 'address' }),
      StellarSdk.nativeToScVal(hashBytes, { type: 'bytes' }),
      StellarSdk.nativeToScVal(params.category, { type: 'u32' }),
      StellarSdk.nativeToScVal(params.fileSizeKb, { type: 'u32' }),
    ];

    // Step 5: Add operation
    txBuilder.addOperation(contract.call('upload_record', ...args));

    // Step 6: Set timeout and build
    txBuilder.setTimeout(30);
    const unsignedTransaction = txBuilder.build();

    // Step 7: Prepare transaction
    const preparedTransaction = await rpcServer.prepareTransaction(unsignedTransaction);

    return preparedTransaction.toXDR();
  } catch (error) {
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
  if (isDemoMode()) {
    const hash = 'demo_tx_' + Math.random().toString(36).substring(7);
    return {
      hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    };
  }

  const rpcServer = getSorobanRpc();

  try {
    const signResult = await freighter.signTransaction(xdr, {
      networkPassphrase,
    });

    if (signResult.error) {
      throw new Error(`Freighter signing failed: ${signResult.error.message}`);
    }

    if (!signResult.signedTxXdr) {
      throw new Error('Freighter did not return a signed transaction');
    }

    const signedTx = StellarSdk.TransactionBuilder.fromXDR(
      signResult.signedTxXdr,
      networkPassphrase
    );

    const submitResult = await rpcServer.sendTransaction(signedTx);

    if (submitResult.status === 'ERROR') {
      const errorDetail = submitResult.errorResult || 'Unknown error';
      throw new Error(`RPC rejected transaction: ${errorDetail}`);
    }

    const txHash = submitResult.hash;

    // Poll for confirmation
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!confirmed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      try {
        const txStatus = await rpcServer.getTransaction(txHash);

        if (txStatus.status === 'SUCCESS') {
          confirmed = true;
          return {
            hash: txHash,
            explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
          };
        }

        if (txStatus.status === 'FAILED') {
          throw new Error(`Transaction failed on-chain`);
        }
      } catch (pollErr) {
        // Continue polling
      }

      attempts++;
    }

    return {
      hash: txHash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
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
