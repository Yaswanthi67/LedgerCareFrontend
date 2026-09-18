import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { fetchDonorDonations, fetchAllCampaigns } from '../services/blockchain';
import { formatEth, formatDate, shortenAddress, getExplorerAddressLink } from '../utils/formatters';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Wallet,
  Heart,
  TrendingUp,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Building2,
} from 'lucide-react';

export default function DonorDashboard() {
  const { account, balance, activeProvider, connectWallet, isConnecting } = useWallet();

  const [donations, setDonations] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);

  const loadDonorData = async () => {
    if (!account || !activeProvider) return;
    setIsLoading(true);
    try {
      const [userDons, allCamps] = await Promise.all([
        fetchDonorDonations(account, activeProvider),
        fetchAllCampaigns(activeProvider),
      ]);
      setDonations(userDons);
      setActiveCampaigns(allCamps.filter((c) => c.status === 0).slice(0, 3));
    } catch (err) {
      console.error('Error loading donor dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account && activeProvider) {
      loadDonorData();
    }
  }, [account, activeProvider]);

  if (!account) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: '#60a5fa',
        }}>
          <Wallet size={32} />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.75rem' }}>
          Connect Your Wallet
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Connect your Web3 MetaMask wallet to view your personal donation history, track the impact of your contributions, and support active charity campaigns.
        </p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          <Wallet size={18} />
          <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
        </button>
      </div>
    );
  }

  // Calculate stats
  let totalDonatedWei = 0n;
  const uniqueCampaignIds = new Set();
  donations.forEach((d) => {
    totalDonatedWei += BigInt(d.amount);
    uniqueCampaignIds.add(d.campaignId);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
            Donor Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <span>Connected:</span>
            <span className="font-mono" style={{ color: '#60a5fa' }}>{shortenAddress(account)}</span>
            <a
              href={getExplorerAddressLink(account)}
              target="_blank"
              rel="noreferrer"
              title="View on Explorer"
              style={{ color: 'var(--text-muted)' }}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <button onClick={loadDonorData} className="btn btn-secondary" title="Refresh">
          <RefreshCw size={16} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(236, 72, 153, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ec4899',
          }}>
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Donated</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
              {formatEth(totalDonatedWei, 4)} ETH
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Directly on Blockchain</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Campaigns Backed</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
              {uniqueCampaignIds.size}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#93c5fd' }}>Verified Causes</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Donations Made</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
              {donations.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Transactions Confirmed</div>
          </div>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Your Donation History
        </h3>

        {isLoading ? (
          <LoadingSpinner message="Querying DonationLedger records for your wallet..." />
        ) : donations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              You have not made any donations with this wallet yet.
            </p>
            <Link to="/campaigns" className="btn btn-primary">
              Explore Active Campaigns
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.donationId}>
                    <td style={{ fontWeight: '600' }}>#{d.donationId}</td>
                    <td>
                      <Link
                        to={`/campaign/${d.campaignId}`}
                        style={{ color: '#60a5fa', fontWeight: '600', textDecoration: 'underline' }}
                      >
                        {d.campaignTitle} (#{d.campaignId})
                      </Link>
                    </td>
                    <td style={{ fontWeight: '700', color: '#34d399' }}>
                      {formatEth(d.amount, 4)} ETH
                    </td>
                    <td>{formatDate(d.timestamp)}</td>
                    <td>
                      <span className="badge badge-verified">Confirmed</span>
                    </td>
                    <td>
                      <Link
                        to={`/campaign/${d.campaignId}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Audit Trail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suggested Active Campaigns to Support */}
      {activeCampaigns.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>
              Recommended Campaigns to Support
            </h3>
            <Link to="/campaigns" style={{ color: '#60a5fa', fontSize: '0.85rem' }}>
              View All
            </Link>
          </div>

          <div className="grid-3">
            {activeCampaigns.map((camp) => (
              <CampaignCard
                key={camp.campaignId}
                campaign={camp}
                onDonateClick={(c) => setSelectedCampaignForDonation(c)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {selectedCampaignForDonation && (
        <DonationModal
          campaign={selectedCampaignForDonation}
          isOpen={true}
          onClose={() => setSelectedCampaignForDonation(null)}
          onDonationSuccess={() => loadDonorData()}
        />
      )}
    </div>
  );
}
