import { UserPlus } from 'lucide-react';

interface GrantAccessButtonProps {
  onClick: () => void;
}

export const GrantAccessButton = ({ onClick }: GrantAccessButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-text-primary rounded-input text-sm font-medium hover:bg-surface-hover transition-colors"
    >
      <UserPlus className="w-4 h-4" />
      Grant Access
    </button>
  );
};
