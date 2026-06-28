import { MedicalRecord, AccessGrant, AuditEntry } from '../types';

interface AppState {
  walletAddress: string | null;
  walletRole: 'patient' | 'doctor' | null;
  records: MedicalRecord[];
  grants: AccessGrant[];
  auditLog: AuditEntry[];
}

let state: AppState = {
  walletAddress: null,
  walletRole: null,
  records: [],
  grants: [],
  auditLog: [],
};

// Wallet change listeners (pub/sub system)
const walletListeners = new Set<(address: string | null) => void>();

export function getState(): AppState {
  return { ...state };
}

export function setWallet(address: string, role: 'patient' | 'doctor'): void {
  state.walletAddress = address;
  state.walletRole = role;
  // Notify all listeners when wallet is set
  walletListeners.forEach(fn => fn(address));
}

export function clearWallet(): void {
  state = {
    walletAddress: null,
    walletRole: null,
    records: [],
    grants: [],
    auditLog: [],
  };
  // Notify all listeners when wallet is cleared
  walletListeners.forEach(fn => fn(null));
}

export function subscribeToWalletChanges(callback: (address: string | null) => void): () => void {
  walletListeners.add(callback);
  // Return unsubscribe function
  return () => {
    walletListeners.delete(callback);
  };
}

export function addRecord(record: MedicalRecord): void {
  state.records.push(record);
}

export function clearRecords(): void {
  state.records = [];
}

export function addGrant(grant: AccessGrant): void {
  state.grants.push(grant);
}

export function removeGrant(grantId: string): void {
  const grant = state.grants.find(g => g.id === grantId);
  if (grant) {
    grant.isActive = false;
  }
}

export function addAuditEntry(entry: AuditEntry): void {
  state.auditLog.push(entry);
}
