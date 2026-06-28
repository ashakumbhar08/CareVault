import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Shield, FileText, Shield as ShieldIcon, Activity, Settings, LogOut, User, Copy, Check, Globe, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { clearWallet } from '../../store/appState';
import { ConfirmationModal } from './ConfirmationModal';

interface SidebarProps {
  role: 'patient' | 'doctor';
  walletAddress: string;
  onDisconnect: () => void;
}

export const Sidebar = ({ role, walletAddress, onDisconnect }: SidebarProps) => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clearDataConfirm, setClearDataConfirm] = useState(false);
  const demoMode = new URLSearchParams(window.location.search).get('demo') === 'true';

  const patientNav = [
    { icon: FileText, label: 'My Records', path: '/patient' },
    { icon: ShieldIcon, label: 'Access Control', path: '/patient/access' },
    { icon: Activity, label: 'Audit Log', path: '/audit' },
  ];

  const doctorNav = [
    { icon: FileText, label: 'Shared With Me', path: '/doctor' },
    { icon: Activity, label: 'Audit Log', path: '/audit' },
  ];

  const navItems = role === 'patient' ? patientNav : doctorNav;

  const isActive = (path: string) => location.pathname === path;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const handleToggleDemoMode = () => {
    const params = new URLSearchParams(window.location.search);
    if (!demoMode) {
      params.set('demo', 'true');
    } else {
      params.delete('demo');
    }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.location.replace(newUrl);
  };

  const handleClearSessionData = () => {
    localStorage.clear();
    sessionStorage.clear();
    clearWallet();
    window.location.href = '/';
  };

  return (
    <div className="w-60 bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="text-xl font-bold text-text-primary">CareVault</span>
        </Link>
        {/* ADDITION 1: Network Status Badge */}
        <div className="flex items-center gap-1.5 mt-1.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs text-gray-400">Stellar Testnet</span>
        </div>
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
        {/* Settings button - not a Link, triggers panel */}
        <button
          onClick={() => setSettingsOpen(true)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-input text-sm font-medium transition-colors text-text-secondary hover:bg-surface-hover hover:text-text-primary`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </nav>

      <div className="border-t border-gray-100 p-4 space-y-3">
        {/* ADDITION 2: Wallet Identity Card */}
        <div className="mx-2 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={14} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">{role === 'patient' ? 'Patient' : 'Doctor'}</p>
              <p className="text-xs text-gray-400 font-mono truncate">{truncatedAddress}</p>
            </div>
            <button
              onClick={handleCopyAddress}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              title="Copy address"
            >
              {copied ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span className="text-xs text-green-600 font-medium">Connected</span>
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

      {/* AREA C: Settings Slide-Out Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="flex-1 bg-black/30"
            />
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 bg-white h-full shadow-xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-gray-600" />
                  <span className="font-semibold text-gray-900">Settings</span>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 flex flex-col gap-6 p-5 overflow-y-auto">
                {/* Section 1: Account */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Account</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-600">Connected as</span>
                      <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                        role === 'patient' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {role === 'patient' ? 'Patient' : 'Doctor'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-600">Wallet</span>
                      <span className="ml-auto font-mono text-xs text-gray-600">{truncatedAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-400" />
                      <span className="text-xs text-gray-600">Network</span>
                      <span className="ml-auto px-2 py-1 text-xs font-medium bg-amber-100 text-amber-600 rounded">
                        Stellar Testnet
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Preferences */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Preferences</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Demo Mode</p>
                        <p className="text-xs text-gray-400 mt-0.5">Simulated blockchain</p>
                      </div>
                      <button
                        onClick={handleToggleDemoMode}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          demoMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <div
                          className={`absolute w-5 h-5 rounded-full bg-white transition-transform top-0.5 ${
                            demoMode ? 'translate-x-4.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                    <button
                      onClick={() => setClearDataConfirm(true)}
                      className="w-full text-sm text-red-500 hover:text-red-700 flex items-center gap-2 py-1.5 px-2 hover:bg-red-50 rounded"
                    >
                      Clear Session Data
                    </button>
                  </div>
                </div>

                {/* Section 3: About */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">About</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-gray-600">CareVault</span>
                      <span className="text-xs text-gray-400">v1.0.0-testnet</span>
                    </div>
                    <a
                      href="https://stellar.expert/explorer/testnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-1.5 text-xs text-blue-500 hover:text-blue-700"
                    >
                      <span>Network</span>
                      <span className="text-gray-400">→</span>
                    </a>
                    <a
                      href="https://github.com/ashakumbhar08/CareVault"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-1.5 text-xs text-blue-500 hover:text-blue-700"
                    >
                      <span>Contracts</span>
                      <span className="text-gray-400">→</span>
                    </a>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-xs text-gray-400">Built for Stellar Level 4</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 p-5">
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={clearDataConfirm}
        title="Clear Session?"
        message="This will disconnect your wallet and clear all local data."
        confirmLabel="Clear"
        isDangerous={true}
        onConfirm={handleClearSessionData}
        onCancel={() => setClearDataConfirm(false)}
      />
    </div>
  );
};
