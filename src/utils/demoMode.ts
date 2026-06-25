import { MedicalRecord, AccessGrant, AuditEntry } from '../types';

export function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).get('demo') === 'true';
}

export const DEMO_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    fileName: 'Annual Checkup 2026',
    category: 'Lab Report',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: '512 KB',
    ipfsHash: 'QmDemoHash1CareVault2026Annual',
    verificationStatus: 'verified',
    sharedWith: ['GD...DEMO'],
  },
  {
    id: '2',
    fileName: 'Blood Work Results',
    category: 'Lab Report',
    uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: '768 KB',
    ipfsHash: 'QmDemoHash2CareVault2026Blood',
    verificationStatus: 'verified',
    sharedWith: [],
  },
  {
    id: '3',
    fileName: 'Prescription May 2026',
    category: 'Prescription',
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: '256 KB',
    ipfsHash: 'QmDemoHash3CareVault2026Prescription',
    verificationStatus: 'pending',
    sharedWith: [],
  },
  {
    id: '4',
    fileName: 'Vaccination Record',
    category: 'Vaccination',
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: '384 KB',
    ipfsHash: 'QmDemoHash4CareVault2026Vaccine',
    verificationStatus: 'verified',
    sharedWith: [],
  },
  {
    id: '5',
    fileName: 'MRI Scan June 2026',
    category: 'Scan',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: '2048 KB',
    ipfsHash: 'QmDemoHash5CareVault2026MRI',
    verificationStatus: 'verified',
    sharedWith: [],
  },
];

export const DEMO_GRANTS: AccessGrant[] = [
  {
    id: '1',
    doctorWallet: 'GDOCT...DEMO',
    doctorName: 'Dr. Smith',
    grantedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
    recordIds: ['1', '2'],
    isActive: true,
  },
  {
    id: '2',
    doctorWallet: 'GDOCT...PAST',
    doctorName: 'Dr. Johnson',
    grantedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    recordIds: ['3'],
    isActive: false,
  },
];

export const DEMO_AUDIT_EVENTS: AuditEntry[] = [
  {
    id: '1',
    type: 'upload',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    actorWallet: 'GPAT...DEMO',
    fileName: 'Prescription May 2026',
    details: 'Uploaded prescription document',
  },
  {
    id: '2',
    type: 'grant',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    actorWallet: 'GPAT...DEMO',
    details: 'Granted access to GDOCT...DEMO for 30 days',
  },
  {
    id: '3',
    type: 'upload',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actorWallet: 'GPAT...DEMO',
    fileName: 'MRI Scan June 2026',
    details: 'Uploaded medical scan',
  },
  {
    id: '4',
    type: 'grant',
    timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    actorWallet: 'GPAT...DEMO',
    details: 'Granted access to GDOCT...PAST for 30 days',
  },
  {
    id: '5',
    type: 'revoke',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    actorWallet: 'GPAT...DEMO',
    details: 'Revoked access granted to GDOCT...PAST',
  },
];
