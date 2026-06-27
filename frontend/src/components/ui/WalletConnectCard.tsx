import { User, Stethoscope } from 'lucide-react';

interface WalletConnectCardProps {
  role: 'patient' | 'doctor';
  onConnect: () => void;
}

export const WalletConnectCard = ({ role, onConnect }: WalletConnectCardProps) => {
  const config = {
    patient: {
      icon: User,
      title: "I'm a Patient",
      description: 'Upload, manage, and share your medical records securely',
      buttonText: 'Connect as Patient',
    },
    doctor: {
      icon: Stethoscope,
      title: "I'm a Doctor",
      description: 'Access patient records shared with you by consent',
      buttonText: 'Connect as Doctor',
    },
  };

  const { icon: Icon, title, description, buttonText } = config[role];

  return (
    <div className="bg-card rounded-card shadow-custom p-8 w-full max-w-md hover:shadow-lg transition-shadow border border-transparent hover:border-accent">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-sm text-text-secondary mb-6">{description}</p>
        <button
          onClick={onConnect}
          className="w-full px-4 py-3 bg-accent text-white rounded-input font-medium hover:bg-accent/90 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
