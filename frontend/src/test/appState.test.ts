import { describe, it, expect, beforeEach } from 'vitest';
import {
  getState,
  setWallet,
  clearWallet,
  addRecord,
  clearRecords,
  addGrant,
  removeGrant,
  addAuditEntry,
} from '../store/appState';
import { MedicalRecord, AccessGrant, AuditEntry } from '../types';

describe('appState', () => {
  beforeEach(() => {
    clearWallet();
  });

  describe('wallet management', () => {
    it('initializes with empty state', () => {
      const state = getState();
      expect(state.walletAddress).toBeNull();
      expect(state.walletRole).toBeNull();
    });

    it('sets wallet address and role', () => {
      setWallet('GDZST3XVCDTUJ76ZAV2HA72KYUJ4AJVU4RFMB22W6KTQEGV2LBTZPAU7', 'patient');
      const state = getState();
      expect(state.walletAddress).toBe('GDZST3XVCDTUJ76ZAV2HA72KYUJ4AJVU4RFMB22W6KTQEGV2LBTZPAU7');
      expect(state.walletRole).toBe('patient');
    });

    it('sets doctor role correctly', () => {
      setWallet('GDZST3XVCDTUJ76ZAV2HA72KYUJ4AJVU4RFMB22W6KTQEGV2LBTZPAU7', 'doctor');
      const state = getState();
      expect(state.walletRole).toBe('doctor');
    });

    it('clears wallet and resets state', () => {
      setWallet('GDZST3XVCDTUJ76ZAV2HA72KYUJ4AJVU4RFMB22W6KTQEGV2LBTZPAU7', 'patient');
      clearWallet();
      const state = getState();
      expect(state.walletAddress).toBeNull();
      expect(state.walletRole).toBeNull();
      expect(state.records).toEqual([]);
      expect(state.grants).toEqual([]);
      expect(state.auditLog).toEqual([]);
    });
  });

  describe('records management', () => {
    it('adds a record to state', () => {
      const record: MedicalRecord = {
        id: '1',
        fileName: 'test.pdf',
        category: 'Prescription',
        uploadedAt: new Date().toISOString(),
        fileSize: '512 KB',
        ipfsHash: 'QmTest123',
        localObjectUrl: null,
        status: 'verified',
        fileRef: null,
        verificationStatus: 'verified',
        sharedWith: [],
      };

      addRecord(record);
      const state = getState();
      expect(state.records).toHaveLength(1);
      expect(state.records[0].id).toBe('1');
    });

    it('clears all records', () => {
      const record: MedicalRecord = {
        id: '1',
        fileName: 'test.pdf',
        category: 'Prescription',
        uploadedAt: new Date().toISOString(),
        fileSize: '512 KB',
        ipfsHash: 'QmTest123',
        localObjectUrl: null,
        status: 'verified',
        fileRef: null,
        verificationStatus: 'verified',
        sharedWith: [],
      };

      addRecord(record);
      clearRecords();
      const state = getState();
      expect(state.records).toHaveLength(0);
    });

    it('maintains multiple records', () => {
      const record1: MedicalRecord = {
        id: '1',
        fileName: 'test1.pdf',
        category: 'Prescription',
        uploadedAt: new Date().toISOString(),
        fileSize: '512 KB',
        ipfsHash: 'QmTest1',
        localObjectUrl: null,
        status: 'verified',
        fileRef: null,
        verificationStatus: 'verified',
        sharedWith: [],
      };

      const record2: MedicalRecord = {
        id: '2',
        fileName: 'test2.pdf',
        category: 'Lab Report',
        uploadedAt: new Date().toISOString(),
        fileSize: '256 KB',
        ipfsHash: 'QmTest2',
        localObjectUrl: null,
        status: 'verified',
        fileRef: null,
        verificationStatus: 'verified',
        sharedWith: [],
      };

      addRecord(record1);
      addRecord(record2);
      const state = getState();
      expect(state.records).toHaveLength(2);
    });
  });

  describe('grants management', () => {
    it('adds a grant to state', () => {
      const grant: AccessGrant = {
        id: '1',
        doctorWallet: 'doctor1',
        recordIds: ['1', '2'],
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        isActive: true,
      };

      addGrant(grant);
      const state = getState();
      expect(state.grants).toHaveLength(1);
      expect(state.grants[0].id).toBe('1');
    });

    it('removes a grant by marking inactive', () => {
      const grant: AccessGrant = {
        id: '1',
        doctorWallet: 'doctor1',
        recordIds: ['1', '2'],
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        isActive: true,
      };

      addGrant(grant);
      removeGrant('1');
      const state = getState();
      expect(state.grants[0].isActive).toBe(false);
    });

    it('maintains multiple grants', () => {
      const grant1: AccessGrant = {
        id: '1',
        doctorWallet: 'doctor1',
        recordIds: ['1'],
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        isActive: true,
      };

      const grant2: AccessGrant = {
        id: '2',
        doctorWallet: 'doctor2',
        recordIds: ['2'],
        grantedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        isActive: true,
      };

      addGrant(grant1);
      addGrant(grant2);
      const state = getState();
      expect(state.grants).toHaveLength(2);
    });
  });

  describe('audit log management', () => {
    it('adds an audit entry', () => {
      const entry: AuditEntry = {
        id: '1',
        action: 'upload',
        timestamp: new Date().toISOString(),
        txHash: 'abc123',
        details: 'Record uploaded successfully',
        recordId: '1',
      };

      addAuditEntry(entry);
      const state = getState();
      expect(state.auditLog).toHaveLength(1);
      expect(state.auditLog[0].action).toBe('upload');
    });

    it('maintains multiple audit entries', () => {
      const entry1: AuditEntry = {
        id: '1',
        action: 'upload',
        timestamp: new Date().toISOString(),
        txHash: 'abc123',
        details: 'Record uploaded',
        recordId: '1',
      };

      const entry2: AuditEntry = {
        id: '2',
        action: 'grant',
        timestamp: new Date().toISOString(),
        txHash: 'def456',
        details: 'Access granted to doctor',
        recordId: '1',
      };

      addAuditEntry(entry1);
      addAuditEntry(entry2);
      const state = getState();
      expect(state.auditLog).toHaveLength(2);
    });
  });
});
