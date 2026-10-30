import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import CharitiesList from './pages/CharitiesList';
import CharityRegister from './pages/CharityRegister';
import CharityVerification from './pages/CharityVerification';
import CreateCampaign from './pages/CreateCampaign';
import CharityCampaigns from './pages/CharityCampaigns';
import CharityDashboard from './pages/CharityDashboard';
import CharityEvidenceUpload from './pages/CharityEvidenceUpload';
import FundUtilization from './pages/FundUtilization';
import DonationSuccess from './pages/DonationSuccess';
import DonationHistory from './pages/DonationHistory';
import DonationReceipt from './pages/DonationReceipt';
import EvidenceVerification from './pages/EvidenceVerification';
import TransparencyTimeline from './pages/TransparencyTimeline';
import BlockchainRecords from './pages/BlockchainRecords';
import AdminDashboard from './pages/AdminDashboard';
import AdminCharityMonitoring from './pages/AdminCharityMonitoring';
import AdminEvidenceMonitoring from './pages/AdminEvidenceMonitoring';
import DonorDashboard from './pages/DonorDashboard';
import About from './pages/About';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: '#070b14',
          color: '#f8fafc',
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#f43f5e' }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', maxWidth: '500px', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <WalletProvider>
          <BrowserRouter>
            <div className="app-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public & Donor Experience */}
                  <Route path="/" element={<Home />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaigns/:id" element={<CampaignDetails />} />
                  <Route path="/campaign/:id" element={<CampaignDetails />} />
                  <Route path="/charities" element={<CharitiesList />} />
                  <Route path="/about" element={<About />} />

                  {/* INR Donations, Success & Receipts */}
                  <Route path="/donation/success" element={<DonationSuccess />} />
                  <Route path="/donations" element={<DonationHistory />} />
                  <Route path="/donations/:id" element={<DonationReceipt />} />

                  {/* Charity Lifecycle */}
                  <Route path="/charity/register" element={<CharityRegister />} />
                  <Route path="/charity/verification" element={<CharityVerification />} />
                  <Route path="/charity/campaigns" element={<CharityCampaigns />} />
                  <Route path="/charity/campaigns/create" element={<CreateCampaign />} />
                  <Route path="/charity/evidence" element={<CharityEvidenceUpload />} />
                  <Route path="/charity/funds" element={<FundUtilization />} />
                  <Route path="/charity/dashboard" element={<CharityDashboard />} />
                  <Route path="/charity" element={<CharityDashboard />} />

                  {/* Cryptographic Verification & Transparency */}
                  <Route path="/blockchain" element={<BlockchainRecords />} />
                  <Route path="/transparency" element={<EvidenceVerification />} />
                  <Route path="/evidence/:id" element={<EvidenceVerification />} />
                  <Route path="/verify" element={<EvidenceVerification />} />
                  <Route path="/transparency/blockchain" element={<BlockchainRecords />} />
                  <Route path="/transparency/:campaignId" element={<TransparencyTimeline />} />

                  {/* Admin Monitoring */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/charities" element={<AdminCharityMonitoring />} />
                  <Route path="/admin/evidence" element={<AdminEvidenceMonitoring />} />

                  {/* User Dashboards & Auth */}
                  <Route path="/dashboard" element={<DonorDashboard />} />
                  <Route path="/donor" element={<DonorDashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Login />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </WalletProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
