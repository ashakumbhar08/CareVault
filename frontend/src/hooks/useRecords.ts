import { useState, useEffect } from 'react';
import {
  readRecords,
  buildUploadRecordTx,
  submitTransaction,
  MedicalRecord as StellarMedicalRecord,
} from '../utils/stellar';
import { useIPFS } from './useIPFS';
import { useToast } from './useToast';
import { useWallet } from './useWallet';
import { MedicalRecord, RecordCategory } from '../types';
import { logInteraction } from '../utils/logInteraction';
import { track } from '../utils/analytics';

interface UseRecordsOptions {
  walletAddress?: string;
  enabled?: boolean;
}

export const useRecords = (options: UseRecordsOptions = {}) => {
  const { walletAddress, enabled = true } = options;
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { upload: uploadToIPFS } = useIPFS();
  const { showToast } = useToast();
  useWallet();

  const fetchRecords = async () => {
    if (!walletAddress || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const stellarRecords = await readRecords(walletAddress);
      const mappedRecords: MedicalRecord[] = stellarRecords.map((r: StellarMedicalRecord) => ({
        id: String(r.record_id),
        fileName: `Record_${r.record_id}`,
        category: mapCategoryFromNumber(r.category),
        uploadedAt: new Date(r.uploaded_at * 1000).toISOString(),
        fileSize: `${r.file_size_kb} KB`,
        ipfsHash: r.ipfs_hash,
        localObjectUrl: null,
        status: 'verified' as const,
        fileRef: null,
        verificationStatus: mapVerificationStatus(r.verification_status),
        sharedWith: [],
      }));
      setRecords(mappedRecords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch records';
      setError(errorMessage);
      console.error('Failed to fetch records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [walletAddress, enabled]);

  const upload = async (file: File, category: RecordCategory) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      showToast('info', 'Encrypting and uploading...');

      const { ipfsHash } = await uploadToIPFS(file, walletAddress);

      showToast('info', 'Creating blockchain transaction...');

      const categoryNumber = mapCategoryToNumber(category);
      const fileSizeKb = Math.ceil(file.size / 1024);

      const xdr = await buildUploadRecordTx({
        patientAddress: walletAddress,
        ipfsHash,
        category: categoryNumber,
        fileSizeKb,
      });

      const { hash, explorerUrl } = await submitTransaction(xdr);

      try {
        await logInteraction({
          walletAddress,
          action: 'upload_record',
          txHash: hash,
          explorerUrl,
          network: import.meta.env.VITE_STELLAR_NETWORK || 'testnet',
        });
      } catch (logErr) {
        console.error('Failed to log interaction:', logErr);
      }

      track.recordUploaded(category, file.size / 1024 / 1024);

      showToast('success', `Record uploaded! Tx: ${hash}`, hash);

      await fetchRecords();

      return { ipfsHash, txHash: hash, explorerUrl };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload record';
      setError(errorMessage);
      showToast('error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    records,
    loading,
    error,
    upload,
    refetch: fetchRecords,
  };
};

function mapCategoryToNumber(category: RecordCategory): number {
  const mapping: Record<RecordCategory, number> = {
    'Prescription': 0,
    'Lab Report': 1,
    'Scan': 2,
    'Vaccination': 3,
    'Discharge Summary': 4,
    'Other': 5,
  };
  return mapping[category] || 5;
}

function mapCategoryFromNumber(num: number): RecordCategory {
  const mapping: Record<number, RecordCategory> = {
    0: 'Prescription',
    1: 'Lab Report',
    2: 'Scan',
    3: 'Vaccination',
    4: 'Discharge Summary',
    5: 'Other',
  };
  return mapping[num] || 'Other';
}

function mapVerificationStatus(status: number): 'pending' | 'verified' | 'failed' {
  const mapping: Record<number, 'pending' | 'verified' | 'failed'> = {
    0: 'pending',
    1: 'verified',
    2: 'failed',
  };
  return mapping[status] || 'pending';
}
