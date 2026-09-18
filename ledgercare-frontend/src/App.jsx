import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import DonorDashboard from './pages/DonorDashboard';
import CharityDashboard from './pages/CharityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DonationHistory from './pages/DonationHistory';
import EvidenceVerification from './pages/EvidenceVerification';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaign/:id" element={<CampaignDetails />} />
              <Route path="/donor" element={<DonorDashboard />} />
              <Route path="/charity" element={<CharityDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/donations" element={<DonationHistory />} />
              <Route path="/verify" element={<EvidenceVerification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}
