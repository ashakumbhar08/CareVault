export type RecordCategory =
  | 'Prescription'
  | 'Lab Report'
  | 'Scan'
  | 'Vaccination'
  | 'Discharge Summary'
  | 'Other';

export type AuditEventType = 'upload' | 'grant' | 'revoke';

export type VerificationStatus = 'verified' | 'pending' | 'failed' | 'uploaded' | 'uploading';

export interface MedicalRecord {
  id: string;
  fileName: string;
  category: RecordCategory;
  uploadedAt: string;
  ipfsHash: string | null;
  localObjectUrl: string | null;
  status: 'uploading' | 'uploaded' | 'verified';
  fileRef: File | null;
  fileSize?: string;
  verificationStatus?: VerificationStatus;
  sharedWith?: string[];
}

export interface AccessGrant {
  id: string;
  doctorWallet: string;
  grantedAt: string;
  expiresAt: string;
  recordIds: string[];
  isActive: boolean;
  doctorName?: string;
}

export interface AuditEntry {
  id: string;
  action: 'upload' | 'grant' | 'revoke';
  timestamp: string;
  txHash: string | null;
  details: string;
  actorWallet?: string;
  recordId?: string;
  fileName?: string;
  type?: AuditEventType;
}

export interface WalletState {
  connected: boolean;
  address: string;
  role: 'patient' | 'doctor' | null;
}
