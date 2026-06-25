import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ConnectWalletPage } from './pages/ConnectWalletPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AuditPage } from './pages/AuditPage';
import { StatsPage } from './pages/StatsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/connect" element={<ConnectWalletPage />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/access" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/audit" element={<AuditPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
