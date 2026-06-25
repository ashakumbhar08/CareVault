import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const isDemoMode = () => {
  try {
    return new URLSearchParams(window.location.search).get('demo') === 'true';
  } catch {
    return false;
  }
};

export const initMonitoring = () => {
  try {
    if (SENTRY_DSN && !isDemoMode()) {
      Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    }
  } catch (error) {
    console.warn('Sentry init failed:', error);
  }
};

export const captureError = (
  error: Error,
  context?: Record<string, any>
) => {
  try {
    if (!SENTRY_DSN || isDemoMode()) {
      console.error('Error:', error, context);
      return;
    }

    Sentry.captureException(error, {
      extra: context,
    });
  } catch (err) {
    console.error('Error capture failed:', err);
  }
};

export const setUserContext = (
  publicKey: string | null,
  role: string | null
) => {
  try {
    if (!SENTRY_DSN || isDemoMode()) return;

    if (publicKey) {
      Sentry.setUser({
        id: publicKey.substring(0, 8), // Don't send full wallet address
        role: role || undefined,
      });
    } else {
      Sentry.setUser(null);
    }
  } catch (error) {
    console.warn('Set user context failed:', error);
  }
};
