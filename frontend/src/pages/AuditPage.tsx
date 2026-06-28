import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { ToastNotification } from '../components/ui/ToastNotification';
import { useToast } from '../hooks/useToast';
import { useWallet } from '../hooks/useWallet';
import { ExternalLink } from 'lucide-react';
import { getState } from '../store/appState';

export const AuditPage = () => {
  const navigate = useNavigate();
  const { disconnect } = useWallet();
  const { toasts, removeToast } = useToast();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Wallet guard
  useEffect(() => {
    const walletStr = sessionStorage.getItem('cv_wallet');
    if (!walletStr) {
      navigate('/connect');
      return;
    }
    try {
      const { address } = JSON.parse(walletStr);
      setWalletAddress(address);
    } catch {
      navigate('/connect');
    }
  }, [navigate]);

  const entries = getState().auditLog.slice().reverse();

  if (!walletAddress) return null;

  return (
    <DashboardLayout role="patient" walletAddress={walletAddress} onDisconnect={disconnect}>
      <div className="space-y-6">
        {/* ADDITION 4: Live Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-sm text-gray-500 mt-0.5">All activity recorded on the Stellar blockchain</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-600 text-xs font-medium px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </div>
        </div>

        <div className="bg-card rounded-card shadow-custom overflow-x-auto">
          {entries.length === 0 ? (
            <div className="p-6">
              <EmptyState variant="records" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-hover">
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Action</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Details</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const actionBadge = {
                    upload: <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">Upload</span>,
                    grant: <span className="px-2 py-1 bg-success/10 text-success text-xs rounded">Grant</span>,
                    revoke: <span className="px-2 py-1 bg-error/10 text-error text-xs rounded">Revoke</span>,
                  }[entry.action];

                  return (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-3 px-4">{actionBadge}</td>
                      <td className="py-3 px-4 text-text-secondary">{entry.details}</td>
                      <td className="py-3 px-4 text-muted text-xs">{new Date(entry.timestamp).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        {entry.txHash && !entry.txHash.startsWith('demo_') && !entry.txHash.startsWith('local_') ? (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${entry.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-accent hover:underline text-xs"
                          >
                            {entry.txHash.slice(0, 8)}…
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : entry.txHash ? (
                          <span className="text-muted text-xs font-mono">{entry.txHash.slice(0, 8)}…</span>
                        ) : (
                          <span className="text-muted text-xs">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ToastNotification toasts={toasts} onClose={removeToast} />
    </DashboardLayout>
  );
};
