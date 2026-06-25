import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface NavbarProps {
  variant?: 'landing' | 'app';
}

export const Navbar = ({ variant = 'landing' }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold text-text-primary">CareVault</span>
          </Link>

          {variant === 'landing' && (
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                How It Works
              </a>
              <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Features
              </a>
              <a href="#security" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Security
              </a>
              <Link
                to="/connect"
                className="px-4 py-2 bg-accent text-white rounded-input text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Connect Wallet
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
