export type RecordCategory =
  | 'Prescription'
  | 'Lab Report'
  | 'Scan'
  | 'Vaccination'
  | 'Discharge Summary'
  | 'Other';

export type AuditEventType = 'upload' | 'grant' | 'revoke' | 'expiry';

export type VerificationStatus = 'verified' | 'pending' | 'failed';

export interface MedicalRecord {
  id: string;
  fileName: string;
  category: RecordCategory;
  uploadedAt: string;
  fileSize: string;
  ipfsHash: string;
  verificationStatus: VerificationStatus;
  sharedWith: string[];
}

export interface AccessGrant {
  id: string;
  doctorWallet: string;
  doctorName: string;
  grantedAt: string;
  expiresAt: string;
  recordIds: string[];
  isActive: boolean;
}

export interface AuditEntry {
  id: string;
  type: AuditEventType;
  timestamp: string;
  actorWallet: string;
  recordId?: string;
  fileName?: string;
  details: string;
}

export interface WalletState {
  connected: boolean;
  address: string;
  role: 'patient' | 'doctor' | null;
}
