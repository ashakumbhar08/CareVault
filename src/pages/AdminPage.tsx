import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import posthog from 'posthog-js';
import { LogOut } from 'lucide-react';

export const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [interactions, setInteractions] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('cv_admin') === 'true';
    if (isAdmin) {
      setAuthenticated(true);
      posthog.capture('admin_dashboard_viewed', {});
      loadInteractions();
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_DEMO_MODE_PASSWORD) {
      sessionStorage.setItem('cv_admin', 'true');
      setAuthenticated(true);
      setPasswordError('');
      posthog.capture('admin_dashboard_viewed', {});
      loadInteractions();
    } else {
      setPasswordError('Incorrect password');
    }
  };

  const loadInteractions = async () => {
    if (!supabase) {
      console.log('Supabase not configured');
      return;
    }
    const { data } = await supabase
      .from('interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    setInteractions(data || []);
  };

  const loadFeedback = async () => {
    if (!supabase) {
      console.log('Supabase not configured');
      return;
    }
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    setFeedback(data || []);
  };

  const exportCSV = (data: any[], filename: string) => {
    const csv = [Object.keys(data[0]).join(','), ...data.map((row) => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-card shadow-lg border border-border p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-text-primary mb-6">Admin Access</h1>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-2 border border-border rounded-input mb-4 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {passwordError && <p className="text-error text-sm mb-4">{passwordError}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-accent text-white rounded-input hover:bg-accent/90 transition-colors"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">CareVault Admin</h1>
            <p className="text-text-secondary">Interaction & Feedback Log</p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('cv_admin');
              window.location.href = '/';
            }}
            className="flex items-center gap-2 px-4 py-2 text-error hover:bg-error/10 rounded-input"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-card border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Interactions</h2>
            <p className="text-3xl font-bold text-accent mb-4">{interactions.length}</p>
            <button
              onClick={() => loadInteractions()}
              className="px-4 py-2 bg-accent text-white rounded-input hover:bg-accent/90 transition-colors mr-2"
            >
              Refresh
            </button>
            <button
              onClick={() => exportCSV(interactions, 'carevault_interactions.csv')}
              className="px-4 py-2 border border-accent text-accent rounded-input hover:bg-accent/10 transition-colors"
            >
              Export CSV
            </button>
          </div>

          <div className="bg-card rounded-card border border-border p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Feedback</h2>
            <p className="text-3xl font-bold text-accent mb-4">{feedback.length}</p>
            <button
              onClick={loadFeedback}
              className="px-4 py-2 bg-accent text-white rounded-input hover:bg-accent/90 transition-colors mr-2"
            >
              Refresh
            </button>
            <button
              onClick={() => exportCSV(feedback, 'carevault_feedback.csv')}
              className="px-4 py-2 border border-accent text-accent rounded-input hover:bg-accent/10 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-card rounded-card border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left font-bold text-text-primary">Wallet</th>
                <th className="px-4 py-2 text-left font-bold text-text-primary">Action</th>
                <th className="px-4 py-2 text-left font-bold text-text-primary">Tx Hash</th>
                <th className="px-4 py-2 text-left font-bold text-text-primary">Network</th>
                <th className="px-4 py-2 text-left font-bold text-text-primary">Time</th>
              </tr>
            </thead>
            <tbody>
              {interactions.slice(page * pageSize, (page + 1) * pageSize).map((row: any) => (
                <tr key={row.id} className="border-b border-border hover:bg-surface-hover">
                  <td className="px-4 py-2">{row.wallet_address}</td>
                  <td className="px-4 py-2">{row.action}</td>
                  <td className="px-4 py-2">
                    {row.tx_hash ? (
                      <a
                        href={row.stellar_explorer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {row.tx_hash.substring(0, 8)}...
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-4 py-2">{row.network}</td>
                  <td className="px-4 py-2 text-xs text-text-secondary">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-border rounded-input disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-text-secondary">Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={(page + 1) * pageSize >= interactions.length}
            className="px-4 py-2 border border-border rounded-input disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
