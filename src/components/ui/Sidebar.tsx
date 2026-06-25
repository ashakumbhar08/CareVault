import { Link, useLocation } from 'react-router-dom';
import { Shield, FileText, Shield as ShieldIcon, Activity, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  role: 'patient' | 'doctor';
  walletAddress: string;
  onDisconnect: () => void;
}

export const Sidebar = ({ role, walletAddress, onDisconnect }: SidebarProps) => {
  const location = useLocation();

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

  return (
    <div className="w-60 bg-card border-r border-border h-screen fixed left-0 top-0 flex flex-col">
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

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-hover rounded-input mb-2">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="text-xs font-mono text-text-secondary">{walletAddress}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-input transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
    </div>
  );
};
