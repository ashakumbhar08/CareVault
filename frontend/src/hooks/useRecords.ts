import { useState, useEffect } from 'react';
import {
  readRecords,
  buildUploadRecordTx,
  submitTransaction,
  MedicalRecord as StellarMedicalRecord,
} from '../utils/stellar';
import { useIPFS } from './useIPFS';
import { useToast } from './useToast';
import { MedicalRecord, RecordCategory } from '../types';
import { logInteraction } from '../utils/logInteraction';
import { track } from '../utils/analytics';
import { getState, setRecords as setGlobalRecords } from '../store/appState';

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
  
  // Import getState to access global wallet address
  // (globalState already imported at top, but make explicit here for clarity)
  const globalState = getState();
  const effectiveWalletAddress = walletAddress || globalState.walletAddress;

  const fetchRecords = async () => {
    console.log('[FETCH RECORDS] ==================== START ====================');
    console.log('[FETCH RECORDS] Wallet address:', effectiveWalletAddress);
    console.log('[FETCH RECORDS] Enabled:', enabled);
    
    if (!effectiveWalletAddress || !enabled) {
      console.log('[FETCH RECORDS] Skipping fetch - no wallet or disabled');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[FETCH RECORDS] Calling readRecords...');
      const stellarRecords = await readRecords(effectiveWalletAddress);
      console.log('[FETCH RECORDS] ✓ Received', stellarRecords.length, 'records from blockchain');
      
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
      
      console.log('[FETCH RECORDS] ✓ Mapped to', mappedRecords.length, 'frontend records');
      console.log('[FETCH RECORDS] Sample record:', mappedRecords[0] ? {
        id: mappedRecords[0].id,
        fileName: mappedRecords[0].fileName,
        category: mappedRecords[0].category,
        ipfsHash: mappedRecords[0].ipfsHash?.substring(0, 20) + '...',
      } : 'none');
      
      console.log('[FETCH RECORDS] Updating local state...');
      setRecords(mappedRecords);
      
      console.log('[FETCH RECORDS] Updating global store...');
      setGlobalRecords(mappedRecords);
      
      console.log('[FETCH RECORDS] ✅ Records successfully stored in both local and global state');
      console.log('[FETCH RECORDS] ==================== END (SUCCESS) ====================');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch records';
      console.error('[FETCH RECORDS] ❌ FAILED:', errorMessage);
      console.error('[FETCH RECORDS] Error details:', err);
      console.log('[FETCH RECORDS] ==================== END (FAILED) ====================');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [effectiveWalletAddress, enabled]);

  const upload = async (file: File, category: RecordCategory) => {
    console.log('[UPLOAD FLOW] ==================== START ====================');
    console.log('[UPLOAD FLOW] File:', file.name, 'Size:', file.size, 'bytes');
    console.log('[UPLOAD FLOW] Category:', category);
    console.log('[UPLOAD FLOW] Wallet:', effectiveWalletAddress);
    
    if (!effectiveWalletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      showToast('info', 'Encrypting and uploading...');
      console.log('[UPLOAD FLOW] [1/4] Uploading to IPFS...');

      const { ipfsHash } = await uploadToIPFS(file, effectiveWalletAddress);
      console.log('[UPLOAD FLOW] ✓ IPFS upload complete, hash:', ipfsHash);

      showToast('info', 'Creating blockchain transaction...');
      console.log('[UPLOAD FLOW] [2/4] Building Soroban transaction...');

      const categoryNumber = mapCategoryToNumber(category);
      const fileSizeKb = Math.ceil(file.size / 1024);

      const xdr = await buildUploadRecordTx({
        patientAddress: effectiveWalletAddress,
        ipfsHash,
        category: categoryNumber,
        fileSizeKb,
      });
      console.log('[UPLOAD FLOW] ✓ Transaction built, ready for signing');

      console.log('[UPLOAD FLOW] [3/4] Submitting transaction...');
      const { hash, explorerUrl } = await submitTransaction(xdr);
      console.log('[UPLOAD FLOW] ✓ Transaction submitted and confirmed!');
      console.log('[UPLOAD FLOW] Transaction hash:', hash);
      console.log('[UPLOAD FLOW] Explorer URL:', explorerUrl);

      console.log('[UPLOAD FLOW] [4/4] Logging interaction...');
      try {
        await logInteraction({
          walletAddress: effectiveWalletAddress,
          action: 'upload_record',
          txHash: hash,
          explorerUrl,
          network: import.meta.env.VITE_STELLAR_NETWORK || 'testnet',
        });
        console.log('[UPLOAD FLOW] ✓ Interaction logged');
      } catch (logErr) {
        console.error('[UPLOAD FLOW] ⚠️  Failed to log interaction:', logErr);
      }

      track.recordUploaded(category, file.size / 1024 / 1024);

      showToast('success', `Record uploaded! Tx: ${hash}`, hash);
      console.log('[UPLOAD FLOW] ✅ SUCCESS - UPLOAD COMPLETE');
      console.log('[UPLOAD FLOW] ==================== END ====================');

      await fetchRecords();

      return { ipfsHash, txHash: hash, explorerUrl };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload record';
      console.error('[UPLOAD FLOW] ❌ UPLOAD FAILED:', errorMessage);
      console.error('[UPLOAD FLOW] Error details:', err);
      console.log('[UPLOAD FLOW] ==================== END (FAILED) ====================');
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
