import React from 'react';
import * as Sentry from '@sentry/react';
import { ShieldX } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: '' };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    this.setState({ errorId: eventId || 'unknown' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="bg-card rounded-card shadow-lg border border-border p-8 max-w-md text-center">
            <ShieldX className="w-12 h-12 text-error mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-text-secondary mb-4">
              We've been notified. Error ID: <code className="text-xs bg-surface-hover px-2 py-1 rounded">{this.state.errorId}</code>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-accent text-white rounded-input font-medium hover:bg-accent/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
