import { FileX, UserX } from 'lucide-react';

interface EmptyStateProps {
  variant: 'records' | 'grants' | 'patients';
  onAction?: () => void;
  actionLabel?: string;
}

export const EmptyState = ({ variant, onAction, actionLabel }: EmptyStateProps) => {
  const config = {
    records: {
      icon: FileX,
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
      icon: FileX,
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
    </div>
  );
};
