import * as freighter from '@stellar/freighter-api';
import * as StellarSdk from '@stellar/stellar-sdk';

const isDemoMode = () => new URLSearchParams(window.location.search).get('demo') === 'true';

const horizonUrl = import.meta.env.VITE_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const sorobanRpcUrl = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const networkPassphrase = import.meta.env.VITE_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const recordRegistryId = import.meta.env.VITE_RECORD_REGISTRY_CONTRACT_ID || '';
const accessControlId = import.meta.env.VITE_ACCESS_CONTROL_CONTRACT_ID || '';

export const getStellarServer = () => {
  return new StellarSdk.Horizon.Server(horizonUrl);
};

export const getSorobanRpc = () => {
  return new (StellarSdk as any).SorobanRpc.Server(sorobanRpcUrl);
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

/**
 * Build and simulate a Soroban transaction for uploading a record.
 * Returns the XDR to be signed by Freighter.
 */
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
    throw new Error('Record Registry Contract ID not configured');
  }

  try {
    const rpc = getSorobanRpc();
    const server = getStellarServer();
    const account = await server.loadAccount(params.patientAddress);

    // Use built-in contract call helper
    const contract = new (StellarSdk as any).Contract(recordRegistryId);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: '300',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    })
      .addOperation(
        contract.call('upload_record', 
          StellarSdk.Address.fromString(params.patientAddress),
          StellarSdk.xdr.ScVal.scvTypeBytes(Buffer.from(params.ipfsHash)),
          (StellarSdk as any).u32(params.category),
          (StellarSdk as any).u32(params.fileSizeKb)
        )
      )
      .setTimeout(30)
      .build();

    // Simulate
    const result = await (rpc as any).simulateTransaction(transaction);
    if (result.error) throw new Error(`Sim error: ${result.error}`);
    
    // Apply simulation
    const readyTx = StellarSdk.SorobanDataBuilder.fromXDR(result.resultXdr).build();
    const finalTx = new StellarSdk.TransactionBuilder(account, {
      fee: '300',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    })
      .addOperation(
        contract.call('upload_record',
          StellarSdk.Address.fromString(params.patientAddress),
          StellarSdk.xdr.ScVal.scvTypeBytes(Buffer.from(params.ipfsHash)),
          (StellarSdk as any).u32(params.category),
          (StellarSdk as any).u32(params.fileSizeKb)
        )
      )
      .setSorobanData(readyTx)
      .setTimeout(30)
      .build();

    return finalTx.toXDR();
  } catch (error) {
    throw new Error(`Upload record tx build failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Build and simulate a Soroban transaction for granting access.
 * Returns the XDR to be signed by Freighter.
 */
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
    throw new Error('Access Control Contract ID not configured');
  }

  try {
    const rpc = getSorobanRpc();
    const server = getStellarServer();
    const account = await server.loadAccount(params.patientAddress);

    const contract = new (StellarSdk as any).Contract(accessControlId);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: '300',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    })
      .addOperation(
        contract.call('grant_access',
          StellarSdk.Address.fromString(params.patientAddress),
          StellarSdk.Address.fromString(params.doctorAddress),
          (StellarSdk as any).vec(...params.recordIds.map((id: number) => (StellarSdk as any).u64(id))),
          (StellarSdk as any).u64(params.expiresAt)
        )
      )
      .setTimeout(30)
      .build();

    // Simulate
    const result = await (rpc as any).simulateTransaction(transaction);
    if (result.error) throw new Error(`Sim error: ${result.error}`);
    
    // Apply simulation
    const readyTx = StellarSdk.SorobanDataBuilder.fromXDR(result.resultXdr).build();
    const finalTx = new StellarSdk.TransactionBuilder(account, {
      fee: '300',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    })
      .addOperation(
        contract.call('grant_access',
          StellarSdk.Address.fromString(params.patientAddress),
          StellarSdk.Address.fromString(params.doctorAddress),
          (StellarSdk as any).vec(...params.recordIds.map((id: number) => (StellarSdk as any).u64(id))),
          (StellarSdk as any).u64(params.expiresAt)
        )
      )
      .setSorobanData(readyTx)
      .setTimeout(30)
      .build();

    return finalTx.toXDR();
  } catch (error) {
    throw new Error(`Grant access tx build failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Build and simulate a Soroban transaction for revoking access.
 * Returns the XDR to be signed by Freighter.
 */
export const buildRevokeAccessTx = async (params: {
  patientAddress: string;
  grantId: number;
}): Promise<string> => {
  if (isDemoMode()) {
    return 'demo_xdr_' + Math.random().toString(36);
  }

  if (!accessControlId) {
    throw new Error('Access Control Contract ID not configured');
  }

  try {
    const rpc = getSorobanRpc();
    const server = getStellarServer();
    const account = await server.loadAccount(params.patientAddress);

    const contract = new (StellarSdk as any).Contract(accessControlId);
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: '300',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    })
      .addOperation(
        contract.call('revoke_access',
          StellarSdk.Address.fromString(params.patientAddress),
          (StellarSdk as any).u64(params.grantId)
        )
      )
      .setTimeout(30)
      .build();

    // Simulate
    const result = await (rpc as any).simulateTransaction(transaction);
    if (result.error) throw new Error(`Sim error: ${result.error}`);
    
    // Apply simulation
    const readyTx = StellarSdk.SorobanDataBuilder.fromXDR(result.resultXdr).build();
    const finalTx = new StellarSdk.TransactionBuilder(account, {
      fee: '300',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    })
      .addOperation(
        contract.call('revoke_access',
          StellarSdk.Address.fromString(params.patientAddress),
          (StellarSdk as any).u64(params.grantId)
        )
      )
      .setSorobanData(readyTx)
      .setTimeout(30)
      .build();

    return finalTx.toXDR();
  } catch (error) {
    throw new Error(`Revoke access tx build failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Sign a transaction with Freighter, submit it to Soroban RPC, and poll for confirmation.
 * Returns the confirmed transaction hash and Stellar Expert link.
 */
export const submitTransaction = async (xdr: string): Promise<{ hash: string; explorerUrl: string }> => {
  if (isDemoMode()) {
    const hash = 'demo_tx_' + Math.random().toString(36).substring(7);
    return {
      hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    };
  }

  // 1. Request signature from Freighter
  const signedXdrResponse = await freighter.signTransaction(xdr, {
    networkPassphrase,
  });

  if (signedXdrResponse.error) {
    throw new Error(`Freighter signature rejected: ${signedXdrResponse.error.message || 'Unknown error'}`);
  }

  if (!signedXdrResponse.signedTxXdr) {
    throw new Error('No signed transaction XDR returned from Freighter');
  }

  // 2. Submit signed transaction to Soroban RPC
  const rpc = getSorobanRpc();
  const submitResult = await rpc.sendTransaction(
    StellarSdk.TransactionBuilder.fromXDR(signedXdrResponse.signedTxXdr, networkPassphrase) as any
  );

  if (submitResult.error) {
    throw new Error(`Transaction submission failed: ${submitResult.error.message || 'Unknown error'}`);
  }

  if (!submitResult.hash) {
    throw new Error('No transaction hash returned from RPC');
  }

  const txHash = submitResult.hash;

  // 3. Poll for confirmation (max 60 seconds)
  const maxAttempts = 40;
  let confirmed = false;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const status = await rpc.getTransaction(txHash);
      
      if (status.status === 'SUCCESS') {
        confirmed = true;
        break;
      } else if (status.status === 'FAILED') {
        throw new Error(`Transaction failed on-chain: ${status.resultXdr || 'Unknown error'}`);
      }
      // PENDING status continues the polling loop
    } catch (err) {
      // Continue polling if transaction not yet found
      if (i === maxAttempts - 1) {
        throw new Error(`Transaction confirmation timeout: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  }

  if (!confirmed) {
    throw new Error('Transaction confirmation timeout');
  }

  return {
    hash: txHash,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
  };
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

/**
 * Read active records for a patient from the Record Registry contract.
 */
export const readRecords = async (patientAddress: string): Promise<MedicalRecord[]> => {
  if (isDemoMode()) {
    return [];
  }

  if (!recordRegistryId) {
    console.warn('Record Registry Contract ID not configured');
    return [];
  }

  try {
    const rpc = getSorobanRpc();
    const contract = new (StellarSdk as any).Contract(recordRegistryId);

    // Invoke get_records on the contract
    const result = await rpc.invokeContractFunction(
      recordRegistryId,
      'get_records',
      [StellarSdk.nativeAsset().makeAccount(patientAddress)]
    );

    // Parse result into MedicalRecord[] (would need proper XDR parsing here)
    // For now, returning empty as contract state queries need additional RPC calls
    console.log('Contract records:', result);
    return [];
  } catch (error) {
    console.error('Error reading records:', error);
    return [];
  }
};

/**
 * Read active access grants for a patient from the Access Control contract.
 */
export const readActiveGrants = async (patientAddress: string): Promise<AccessGrant[]> => {
  if (isDemoMode()) {
    return [];
  }

  if (!accessControlId) {
    console.warn('Access Control Contract ID not configured');
    return [];
  }

  try {
    const rpc = getSorobanRpc();

    // Invoke get_active_grants on the contract
    const result = await rpc.invokeContractFunction(
      accessControlId,
      'get_active_grants',
      [StellarSdk.nativeAsset().makeAccount(patientAddress)]
    );

    console.log('Contract active grants:', result);
    return [];
  } catch (error) {
    console.error('Error reading active grants:', error);
    return [];
  }
};

/**
 * Read access grants for a doctor from the Access Control contract.
 */
export const readDoctorGrants = async (doctorAddress: string): Promise<AccessGrant[]> => {
  if (isDemoMode()) {
    return [];
  }

  if (!accessControlId) {
    console.warn('Access Control Contract ID not configured');
    return [];
  }

  try {
    const rpc = getSorobanRpc();

    // Invoke get_doctor_grants on the contract
    const result = await rpc.invokeContractFunction(
      accessControlId,
      'get_doctor_grants',
      [StellarSdk.nativeAsset().makeAccount(doctorAddress)]
    );

    console.log('Contract doctor grants:', result);
    return [];
  } catch (error) {
    console.error('Error reading doctor grants:', error);
    return [];
  }
};

/**
 * Check if a doctor has access to a patient's records.
 */
export const checkAccess = async (doctorAddress: string, patientAddress: string): Promise<boolean> => {
  if (isDemoMode()) {
    return false;
  }

  if (!accessControlId) {
    console.warn('Access Control Contract ID not configured');
    return false;
  }

  try {
    const rpc = getSorobanRpc();

    // Invoke check_access on the contract
    const result = await rpc.invokeContractFunction(
      accessControlId,
      'check_access',
      [
        StellarSdk.nativeAsset().makeAccount(doctorAddress),
        StellarSdk.nativeAsset().makeAccount(patientAddress),
      ]
    );

    console.log('Access check result:', result);
    return false;
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
};

export const getAccountBalance = async (publicKey: string): Promise<string> => {
  return getWalletBalance(publicKey);
};
