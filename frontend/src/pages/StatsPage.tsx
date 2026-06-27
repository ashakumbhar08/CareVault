import { useState, useEffect } from 'react';
import { Shield, Zap, Users, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value }: any) => (
  <div className="bg-card rounded-card border border-border p-6 text-center">
    <Icon className="w-8 h-8 text-accent mx-auto mb-4" />
    <p className="text-text-secondary text-sm mb-2">{label}</p>
    <p className="text-4xl font-bold text-accent">{value}</p>
  </div>
);

export const StatsPage = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({
    records: 0,
    grants: 0,
    events: 0,
    users: 0,
  });

  useEffect(() => {
    const targets = { records: 5, grants: 1, events: 5, users: 10 };
    const intervals: ReturnType<typeof setInterval>[] = [];

    Object.entries(targets).forEach(([key, target]) => {
      let current = 0;
      const interval = setInterval(() => {
        current += Math.ceil(target / 50);
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        setCounters((prev) => ({ ...prev, [key]: current }));
      }, 30);
      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-accent" />
            <h1 className="text-4xl font-bold text-text-primary">CareVault</h1>
          </div>
          <p className="text-lg text-text-secondary mb-4">Built on Stellar Blockchain</p>
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-input">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Stellar Testnet — Live
          </div>
        </div>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-4 mb-12">
          <StatCard icon={Shield} label="Records Secured" value={counters.records} />
          <StatCard icon={Zap} label="Active Grants" value={counters.grants} />
          <StatCard icon={Award} label="Audit Events" value={counters.events} />
          <StatCard icon={Users} label="Users Onboarded" value={counters.users} />
        </div>

        <div className="bg-card rounded-card border border-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Smart Contracts</h2>
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4 bg-surface-hover rounded-input">
              <div>
                <p className="font-bold text-text-primary">RecordRegistry</p>
                <p className="text-sm text-text-secondary">{import.meta.env.VITE_RECORD_REGISTRY_CONTRACT_ID || 'Not configured'}</p>
              </div>
              {import.meta.env.VITE_RECORD_REGISTRY_CONTRACT_ID && (
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${import.meta.env.VITE_RECORD_REGISTRY_CONTRACT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm"
                >
                  View on Explorer →
                </a>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-4 bg-surface-hover rounded-input">
              <div>
                <p className="font-bold text-text-primary">AccessControl</p>
                <p className="text-sm text-text-secondary">{import.meta.env.VITE_ACCESS_CONTROL_CONTRACT_ID || 'Not configured'}</p>
              </div>
              {import.meta.env.VITE_ACCESS_CONTROL_CONTRACT_ID && (
                <a
                  href={`https://stellar.expert/explorer/testnet/contract/${import.meta.env.VITE_ACCESS_CONTROL_CONTRACT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm"
                >
                  View on Explorer →
                </a>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-4">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {['Stellar', 'Soroban', 'React', 'TypeScript', 'IPFS', 'Freighter'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-accent/10 text-accent rounded-badge text-xs font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/?demo=true')}
            className="flex-1 px-6 py-3 bg-accent text-white rounded-input hover:bg-accent/90 transition-colors font-medium"
          >
            Try Demo
          </button>
          <button
            onClick={() => navigate('/connect')}
            className="flex-1 px-6 py-3 border border-accent text-accent rounded-input hover:bg-accent/10 transition-colors font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};
