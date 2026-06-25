import { useState, useEffect } from 'react';
import { getStellarServer } from '../utils/stellar';
import { AuditEntry, AuditEventType } from '../types';

interface UseAuditLogOptions {
  walletAddress?: string;
  enabled?: boolean;
}

export const useAuditLog = (options: UseAuditLogOptions = {}) => {
  const { walletAddress, enabled = true } = options;
  const [events, setEvents] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuditLog = async () => {
    if (!walletAddress || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const server = getStellarServer();
      const transactions = await server
        .transactions()
        .forAccount(walletAddress)
        .order('desc')
        .limit(50)
        .call();

      const auditEntries: AuditEntry[] = [];

      for (const tx of transactions.records) {
        const operations = await tx.operations();
        
        for (const op of operations.records) {
          if (op.type === 'invoke_host_function') {
            const entry: AuditEntry = {
              id: tx.id,
              timestamp: tx.created_at,
              type: parseActionFromOperation(op),
              actorWallet: tx.source_account,
              details: `Transaction: ${tx.hash.substring(0, 8)}...`,
            };
            auditEntries.push(entry);
          }
        }
      }

      setEvents(auditEntries);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit log';
      setError(errorMessage);
      console.error('Failed to fetch audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLog();
  }, [walletAddress, enabled]);

  const filterBy = (type?: AuditEventType) => {
    if (!type) return events;
    return events.filter((event) => event.type === type);
  };

  return {
    events,
    loading,
    error,
    filterBy,
    refetch: fetchAuditLog,
  };
};

function parseActionFromOperation(operation: any): AuditEventType {
  try {
    const functionName = operation.function || '';
    
    if (functionName.includes('upload_record')) return 'upload';
    if (functionName.includes('grant_access')) return 'grant';
    if (functionName.includes('revoke_access')) return 'revoke';
    
    return 'upload';
  } catch {
    return 'upload';
  }
}
