import { useState, useEffect, useCallback } from 'react';
import { getStellarServer } from '../utils/stellar';

export interface ContractEvent {
  type: 'grant_created' | 'grant_revoked' | 'record_uploaded' | 'record_verified';
  txHash: string;
  timestamp: number;
  data: Record<string, any>;
}

interface UseContractEventsOptions {
  walletAddress?: string;
  enabled?: boolean;
  pollInterval?: number;
}

export const useContractEvents = (options: UseContractEventsOptions = {}) => {
  const { walletAddress, enabled = true, pollInterval = 15000 } = options;
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!walletAddress || !enabled) return;

    try {
      setLoading(true);
      const server = getStellarServer();

      // Query transactions for the wallet address via Horizon
      await server
        .accounts()
        .accountId(walletAddress)
        .call();

      // In production, query recent transactions with filters
      const newEvents: ContractEvent[] = [];

      setEvents(newEvents);
    } catch (err) {
      console.error('Failed to fetch contract events:', err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, enabled]);

  useEffect(() => {
    if (!enabled || !walletAddress) return;

    // Fetch immediately
    fetchEvents();

    // Poll at specified interval
    const interval = setInterval(fetchEvents, pollInterval);

    return () => clearInterval(interval);
  }, [walletAddress, enabled, pollInterval, fetchEvents]);

  return {
    events,
    loading,
    refetch: fetchEvents,
  };
};
