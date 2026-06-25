import { UploadCloud } from 'lucide-react';

interface UploadButtonProps {
  onClick: () => void;
}

export const UploadButton = ({ onClick }: UploadButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-input text-sm font-medium hover:bg-accent/90 transition-colors"
    >
      <UploadCloud className="w-4 h-4" />
      Upload Record
    </button>
  );
};
