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
    throw new Error('Record Registry Contract ID not configured');
  }

  try {
    const server = getStellarServer();
    const account = await server.loadAccount(params.patientAddress);

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    });

    txBuilder.addMemo(StellarSdk.Memo.text('upload_record'));
    const transaction = txBuilder.build();

    return transaction.toXDR();
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
    throw new Error('Access Control Contract ID not configured');
  }

  try {
    const server = getStellarServer();
    const account = await server.loadAccount(params.patientAddress);

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    });

    txBuilder.addMemo(StellarSdk.Memo.text('grant_access'));
    const transaction = txBuilder.build();

    return transaction.toXDR();
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
    throw new Error('Access Control Contract ID not configured');
  }

  try {
    const server = getStellarServer();
    const account = await server.loadAccount(params.patientAddress);

    const txBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: '100',
      networkPassphrase,
      timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
    });

    txBuilder.addMemo(StellarSdk.Memo.text('revoke_access'));
    const transaction = txBuilder.build();

    return transaction.toXDR();
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
      throw new Error(`Freighter signature rejected: ${signedXdrResponse.error.message || 'Unknown error'}`);
    }

    if (!signedXdrResponse.signedTxXdr) {
      throw new Error('No signed transaction XDR returned from Freighter');
    }

    const server = getStellarServer();
    const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdrResponse.signedTxXdr, networkPassphrase);
    const result = await server.submitTransaction(transaction as any);

    return {
      hash: result.hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
    };
  } catch (error) {
    throw new Error(`Transaction submission failed: ${error instanceof Error ? error.message : String(error)}`);
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
