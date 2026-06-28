import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Shield, FileText, Shield as ShieldIcon, Activity, Settings, LogOut, User, Copy, Check } from 'lucide-react';

interface SidebarProps {
  role: 'patient' | 'doctor';
  walletAddress: string;
  onDisconnect: () => void;
}

export const Sidebar = ({ role, walletAddress, onDisconnect }: SidebarProps) => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const patientNav = [
    { icon: FileText, label: 'My Records', path: '/patient' },
    { icon: ShieldIcon, label: 'Access Control', path: '/patient/access' },
    { icon: Activity, label: 'Audit Log', path: '/audit' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const doctorNav = [
    { icon: FileText, label: 'Shared With Me', path: '/doctor' },
    { icon: Activity, label: 'Audit Log', path: '/audit' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const navItems = role === 'patient' ? patientNav : doctorNav;

  const isActive = (path: string) => location.pathname === path;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <div className="w-60 bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="text-xl font-bold text-text-primary">CareVault</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-input text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Connected Wallet</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs font-mono text-gray-600 truncate">{truncatedAddress}</span>
              <button
                onClick={handleCopyAddress}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                title="Copy address"
              >
                {copied ? (
                  <Check size={12} className="text-green-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="w-full text-xs text-red-400 hover:text-red-600 flex items-center justify-center gap-1 transition-colors font-medium py-1.5 px-2 hover:bg-red-50 rounded-input"
        >
          <LogOut className="w-3 h-3" />
          Disconnect
        </button>
      </div>
    </div>
  );
};
