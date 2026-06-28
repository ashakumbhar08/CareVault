import { FileText, UserX, Upload, UserPlus, Shield } from 'lucide-react';

interface EmptyStateProps {
  variant: 'records' | 'grants' | 'patients';
  onAction?: () => void;
  actionLabel?: string;
  role?: 'patient' | 'doctor';
}

export const EmptyState = ({ variant, onAction, actionLabel, role }: EmptyStateProps) => {
  const FileXIcon = FileText;
  const config = {
    records: {
      icon: FileXIcon,
      title: 'No records yet',
      description: 'Upload your first medical record to get started',
      showAction: true,
      defaultActionLabel: 'Upload Record',
    },
    grants: {
      icon: UserX,
      title: 'No access grants',
      description: 'Share records with your doctor to grant access',
      showAction: true,
      defaultActionLabel: 'Grant Access',
    },
    patients: {
      icon: FileXIcon,
      title: 'No records shared with you',
      description: 'Records will appear here when patients grant you access',
      showAction: false,
      defaultActionLabel: '',
    },
  };

  const { icon: Icon, title, description, showAction, defaultActionLabel } = config[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>
      {showAction && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-accent text-white rounded-input text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          {actionLabel || defaultActionLabel}
        </button>
      )}

      {/* ADDITION 6: Quick-action card only for empty patient dashboard */}
      {variant === 'records' && role === 'patient' && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto w-full">
          {[
            { icon: Upload, label: 'Upload records', sub: 'PDFs and images supported', color: 'blue' },
            { icon: UserPlus, label: 'Share with doctors', sub: 'Time-limited access', color: 'green' },
            { icon: Shield, label: 'Stay private', sub: 'AES-256 encrypted', color: 'purple' },
          ].map(item => {
            const Icon = item.icon;
            const bgColor = {
              blue: 'bg-blue-50 border-blue-100',
              green: 'bg-green-50 border-green-100',
              purple: 'bg-purple-50 border-purple-100',
            }[item.color];
            const iconColor = {
              blue: 'text-blue-500',
              green: 'text-green-500',
              purple: 'text-purple-500',
            }[item.color];
            return (
              <div key={item.label} className={`${bgColor} border rounded-xl p-3 text-center`}>
                <Icon size={18} className={`${iconColor} mx-auto mb-1.5`} />
                <p className="text-xs font-medium text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
