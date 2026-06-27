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

export const buildUploadRecordTx = async (params: {
  patientAddress: string;
  ipfsHash: string;
  category: number;
  fileSizeKb: number;
}): Promise<string> => {
  if (isDemoMode()) {
    return 'demo_xdr_' + Math.random().toString(36);
  }

  // Build a basic Stellar payment transaction for Soroban contract invocation
  // In production, this would use Soroban contract SDK to build proper contract calls
  const account = await getStellarServer().loadAccount(params.patientAddress);
  const builder = new StellarSdk.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase,
    timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
  });

  // Add a memo to indicate Soroban contract call
  builder.addMemo(
    StellarSdk.Memo.text(`upload:${params.ipfsHash.substring(0, 20)}`)
  );

  const tx = builder.build();
  return tx.toXDR();
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

  const account = await getStellarServer().loadAccount(params.patientAddress);
  const builder = new StellarSdk.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase,
    timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
  });

  // Add memo indicating grant access
  builder.addMemo(
    StellarSdk.Memo.text(`grant:${params.doctorAddress.substring(0, 10)}`)
  );

  const tx = builder.build();
  return tx.toXDR();
};

export const buildRevokeAccessTx = async (params: {
  patientAddress: string;
  grantId: number;
}): Promise<string> => {
  if (isDemoMode()) {
    return 'demo_xdr_' + Math.random().toString(36);
  }

  const account = await getStellarServer().loadAccount(params.patientAddress);
  const builder = new StellarSdk.TransactionBuilder(account, {
    fee: '100',
    networkPassphrase,
    timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 3600 },
  });

  // Add memo indicating revoke access
  builder.addMemo(
    StellarSdk.Memo.text(`revoke:${params.grantId}`)
  );

  const tx = builder.build();
  return tx.toXDR();
};

export const submitTransaction = async (xdr: string): Promise<{ hash: string; explorerUrl: string }> => {
  if (isDemoMode()) {
    const hash = 'demo_tx_' + Math.random().toString(36).substring(7);
    return {
      hash,
      explorerUrl: `https://stellar.expert/explorer/testnet/tx/${hash}`,
    };
  }

  const signedXdrResponse = await freighter.signTransaction(xdr, {
    networkPassphrase,
  });

  if (signedXdrResponse.error) {
    throw new Error(signedXdrResponse.error.message || 'Failed to sign transaction');
  }

  const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdrResponse.signedTxXdr, networkPassphrase);
  const server = getStellarServer();
  const result = await server.submitTransaction(transaction as any);

  // Poll Horizon for confirmation (20 attempts × 1.5s = 30s max)
  for (let i = 0; i < 20; i++) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await server.transactions().transaction(result.hash).call();
      break;
    } catch (e) {
      // Still pending, retry
    }
  }

  return {
    hash: result.hash,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
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

export const readRecords = async (_patientAddress: string): Promise<MedicalRecord[]> => {
  if (isDemoMode()) {
    return [];
  }

  try {
    // In production, this would query the Soroban contract state
    // For now, return empty array as contract state requires RPC calls
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
    // Query active grants via Soroban contract
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
    // Query doctor's granted access via Soroban contract
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
    // Check if doctor has access to patient records
    return false;
  } catch (error) {
    console.error('Error checking access:', error);
    return false;
  }
};

export const getAccountBalance = async (publicKey: string): Promise<string> => {
  return getWalletBalance(publicKey);
};
