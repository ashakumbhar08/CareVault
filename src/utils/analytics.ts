import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const isDemoMode = () => {
  try {
    return new URLSearchParams(window.location.search).get('demo') === 'true';
  } catch {
    return false;
  }
};

export const initAnalytics = () => {
  try {
    if (POSTHOG_KEY && !isDemoMode()) {
      posthog.init(POSTHOG_KEY, {
        api_host: 'https://app.posthog.com',
        autocapture: false,
      });
    }
  } catch (error) {
    console.warn('PostHog init failed:', error);
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    if (!POSTHOG_KEY || isDemoMode()) {
      console.log('Analytics event:', eventName, properties);
      return;
    }

    posthog.capture(eventName, properties);
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Specific event trackers
export const track = {
  walletConnected: (role: string, network: string) => {
    trackEvent('wallet_connected', { role, network });
  },

  onboardingStepCompleted: (step: number) => {
    trackEvent('onboarding_step_completed', { step });
  },

  onboardingCompleted: (role: string) => {
    trackEvent('onboarding_completed', { role });
  },

  recordUploaded: (category: string, fileSizeMB: number) => {
    trackEvent('record_uploaded', { category, fileSizeMB });
  },

  accessGranted: (durationDays: number, recordCount: number) => {
    trackEvent('access_granted', { durationDays, recordCount });
  },

  accessRevoked: () => {
    trackEvent('access_revoked');
  },

  auditLogViewed: () => {
    trackEvent('audit_log_viewed');
  },

  doctorViewedRecords: (recordCount: number) => {
    trackEvent('doctor_viewed_records', { recordCount });
  },

  feedbackSubmitted: (rating: number) => {
    trackEvent('feedback_submitted', { rating });
  },

  demoModeActivated: () => {
    trackEvent('demo_mode_activated');
  },
};
