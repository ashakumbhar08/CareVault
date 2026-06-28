import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ConnectWalletPage } from './pages/ConnectWalletPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AuditPage } from './pages/AuditPage';
import { StatsPage } from './pages/StatsPage';
import { AdminPage } from './pages/AdminPage';
import { Step1Welcome } from './pages/onboarding/Step1Welcome';
import { WelcomePage } from './pages/onboarding/WelcomePage';
import { InstallWalletPage } from './pages/onboarding/InstallWalletPage';
import { RoleSelectionPage } from './pages/onboarding/RoleSelectionPage';
import { FundWalletPage } from './pages/onboarding/FundWalletPage';
import { FirstRecordPage } from './pages/onboarding/FirstRecordPage';
import { WalletDisconnectedOverlay } from './components/ui/WalletDisconnectedOverlay';
import { subscribeToWalletChanges } from './store/appState';

function AppContent() {
  const navigate = useNavigate();
  const [showDisconnected, setShowDisconnected] = useState(false);

  // Root-level wallet subscription (runs once, never unsubscribes)
  useEffect(() => {
    subscribeToWalletChanges((address) => {
      if (address === null) {
        setShowDisconnected(true);
      }
    });
    // Note: We intentionally don't clean up this subscription
    // It should persist for the lifetime of the app
    // eslint-disable-next-line no-unreachable
    return undefined;
  }, []);

  // Navigate when user dismisses overlay
  const handleReconnect = () => {
    setShowDisconnected(false);
    navigate('/connect');
  };

  return (
    <>
      {showDisconnected && (
        <WalletDisconnectedOverlay onReconnect={handleReconnect} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/connect" element={<ConnectWalletPage />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/access" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/audit" element={<AuditPage />} />
        
        {/* Onboarding Routes */}
        <Route path="/onboarding" element={<Step1Welcome />} />
        <Route path="/onboarding/welcome" element={<WelcomePage />} />
        <Route path="/onboarding/wallet" element={<InstallWalletPage />} />
        <Route path="/onboarding/role" element={<RoleSelectionPage />} />
        <Route path="/onboarding/fund" element={<FundWalletPage />} />
        <Route path="/onboarding/record" element={<FirstRecordPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
