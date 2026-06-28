import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="p-6 flex items-start gap-4">
          {isDangerous && (
            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-error" />
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary mb-1">{title}</h2>
            <p className="text-sm text-text-secondary">{message}</p>
          </div>
        </div>

        <div className="p-6 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-input transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-input transition-colors disabled:opacity-50 ${
              isDangerous
                ? 'bg-error hover:bg-error/90'
                : 'bg-accent hover:bg-accent/90'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
