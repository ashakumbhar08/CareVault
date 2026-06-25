import { useState, useEffect } from 'react';
import {
  readActiveGrants,
  readDoctorGrants,
  buildGrantAccessTx,
  buildRevokeAccessTx,
  submitTransaction,
  AccessGrant as StellarAccessGrant,
} from '../utils/stellar';
import { useToast } from './useToast';
import { AccessGrant } from '../types';

interface UseAccessGrantsOptions {
  walletAddress?: string;
  role?: 'patient' | 'doctor';
  enabled?: boolean;
}

export const useAccessGrants = (options: UseAccessGrantsOptions = {}) => {
  const { walletAddress, role = 'patient', enabled = true } = options;
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchGrants = async () => {
    if (!walletAddress || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const stellarGrants =
        role === 'patient'
          ? await readActiveGrants(walletAddress)
          : await readDoctorGrants(walletAddress);

      const mappedGrants: AccessGrant[] = stellarGrants.map((g: StellarAccessGrant) => ({
        id: String(g.grant_id),
        doctorWallet: g.doctor,
        doctorName: `Doctor ${g.doctor.substring(0, 8)}...`,
        recordIds: g.record_ids.map(String),
        grantedAt: new Date(g.granted_at * 1000).toISOString(),
        expiresAt: new Date(g.expires_at * 1000).toISOString(),
        isActive: g.is_active,
      }));

      setGrants(mappedGrants);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch grants';
      setError(errorMessage);
      console.error('Failed to fetch grants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, [walletAddress, role, enabled]);

  const grantAccess = async (
    doctorAddress: string,
    recordIds: string[],
    expiresAt: Date
  ) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      showToast('info', 'Creating access grant...');

      const expiresAtTimestamp = Math.floor(expiresAt.getTime() / 1000);
      const recordIdsNumbers = recordIds.map(Number);

      const xdr = await buildGrantAccessTx({
        patientAddress: walletAddress,
        doctorAddress,
        recordIds: recordIdsNumbers,
        expiresAt: expiresAtTimestamp,
      });

      const { hash, explorerUrl } = await submitTransaction(xdr);

      showToast('success', `Access granted to ${recordIds.length} record(s)`, hash);

      await fetchGrants();

      return { txHash: hash, explorerUrl };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to grant access';
      setError(errorMessage);
      showToast('error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async (grantId: string) => {
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);

      showToast('info', 'Revoking access...');

      const xdr = await buildRevokeAccessTx({
        patientAddress: walletAddress,
        grantId: Number(grantId),
      });

      const { hash, explorerUrl } = await submitTransaction(xdr);

      showToast('success', 'Access revoked successfully', hash);

      setGrants((prevGrants) =>
        prevGrants.map((grant) =>
          grant.id === grantId ? { ...grant, isActive: false } : grant
        )
      );

      return { txHash: hash, explorerUrl };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke access';
      setError(errorMessage);
      showToast('error', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    grants,
    loading,
    error,
    grantAccess,
    revokeAccess,
    refetch: fetchGrants,
  };
};
