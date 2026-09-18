import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import {
  fetchCampaignDetails,
  fetchCampaignDonations,
  fetchCampaignFundUsages,
} from '../services/blockchain';
import CampaignProgress from '../components/CampaignProgress';
import DonationModal from '../components/DonationModal';
import EvidenceCard from '../components/EvidenceCard';
import AuditTimeline from '../components/AuditTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatEth, formatDate, shortenAddress, getExplorerAddressLink } from '../utils/formatters';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Heart,
  Clock,
  ShieldCheck,
  FileCheck2,
  ListOrdered,
  History,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function CampaignDetails() {
  const { id } = useParams();
  const { activeProvider, account } = useWallet();

  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [usages, setUsages] = useState([]);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'donations' | 'usages' | 'charity'
  const [isLoading, setIsLoading] = useState(true);
  const [isDonating, setIsDonating] = useState(false);

  const loadAllDetails = async () => {
    if (!activeProvider || !id) return;
    setIsLoading(true);
    try {
      const campaignId = parseInt(id, 10);
      const [campData, donList, usageList] = await Promise.all([
        fetchCampaignDetails(campaignId, activeProvider),
        fetchCampaignDonations(campaignId, activeProvider),
        fetchCampaignFundUsages(campaignId, activeProvider),
      ]);

      setCampaign(campData);
      setDonations(donList);
      setUsages(usageList);
    } catch (err) {
      console.error('Error loading campaign details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllDetails();
  }, [id, activeProvider]);

  if (isLoading) {
    return <LoadingSpinner message="Querying campaign smart contract and ledger..." />;
  }

  if (!campaign) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <AlertCircle size={48} color="#f43f5e" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>Campaign Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          No campaign exists on the blockchain with ID #{id}.
        </p>
        <Link to="/campaigns" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Campaigns
        </Link>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (campaign.status) {
      case 0:
        return <span className="badge badge-active">Active</span>;
      case 1:
        return <span className="badge badge-completed">Completed</span>;
      case 2:
        return <span className="badge badge-cancelled">Cancelled</span>;
      default:
        return <span className="badge">Unknown</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back Link */}
      <div>
        <Link
          to="/campaigns"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
          }}
        >
          <ArrowLeft size={16} /> Back to All Campaigns
        </Link>
      </div>

      {/* Main Campaign Header Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.06)',
                padding: '0.2rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
              }}>
                Campaign #{campaign.campaignId}
              </span>
              {getStatusBadge()}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.25 }}>
              {campaign.title}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={loadAllDetails} className="btn btn-secondary" title="Refresh">
              <RefreshCw size={16} />
            </button>
            {campaign.status === 0 && (
              <button
                onClick={() => setIsDonating(true)}
                className="btn btn-primary btn-lg"
              >
                <Heart size={18} fill="currentColor" />
                <span>Donate Now</span>
              </button>
            )}
          </div>
        </div>

        <p style={{
          fontSize: '0.98rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2rem',
          maxWidth: '900px',
        }}>
          {campaign.description}
        </p>

        {/* Campaign Metrics & Progress */}
        <div style={{
          background: 'rgba(7, 11, 20, 0.7)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
        }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <CampaignProgress
              raisedAmount={campaign.raisedAmount}
              targetAmount={campaign.targetAmount}
              withdrawnAmount={campaign.withdrawnAmount}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Goal</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>
                {formatEth(campaign.targetAmount)} ETH
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Raised</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#34d399' }}>
                {formatEth(campaign.raisedAmount)} ETH
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Withdrawn for Use</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fbbf24' }}>
                {formatEth(campaign.withdrawnAmount)} ETH
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Start Date</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>
                {formatDate(campaign.startDate)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>End Date</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>
                {formatDate(campaign.endDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Verified Charity Quick Summary */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
            }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>
                  {campaign.charity ? campaign.charity.organizationName : 'Registered Charity'}
                </span>
                <span className="badge badge-verified" style={{ fontSize: '0.65rem' }}>
                  Verified
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Wallet: {campaign.charityWallet}
              </div>
            </div>
          </div>

          <a
            href={getExplorerAddressLink(campaign.charityWallet)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <span>Explorer</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'audit' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'audit' ? '#60a5fa' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          <History size={16} />
          <span>Full Audit Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'donations' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'donations' ? '#60a5fa' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          <Heart size={16} />
          <span>Donations ({donations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('usages')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'usages' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'usages' ? '#60a5fa' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          <FileCheck2 size={16} />
          <span>Fund Usages & Evidence ({usages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('charity')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.6rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'charity' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'charity' ? '#60a5fa' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.88rem',
            cursor: 'pointer',
          }}
        >
          <Building2 size={16} />
          <span>Charity Profile</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'audit' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.5rem' }}>
            Immutable Campaign Audit Trail
          </h3>
          <AuditTimeline campaign={campaign} donations={donations} usages={usages} />
        </div>
      )}

      {activeTab === 'donations' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
            Recorded Campaign Donations
          </h3>

          {donations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
              No donations have been made to this campaign yet. Be the first backer!
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Donor Wallet</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.donationId}>
                      <td style={{ fontWeight: '600' }}>#{d.donationId}</td>
                      <td className="font-mono" style={{ color: '#93c5fd' }}>
                        {shortenAddress(d.donor)}
                      </td>
                      <td style={{ fontWeight: '700', color: '#34d399' }}>
                        {formatEth(d.amount)} ETH
                      </td>
                      <td>{formatDate(d.timestamp)}</td>
                      <td>
                        <span className="badge badge-verified">On-Chain</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'usages' && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>
              Proof of Expenditure & Evidence
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Expenditure records with Keccak-256 cryptographic hashes and IPFS document proofs.
            </p>
          </div>

          {usages.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                No fund usages or evidence have been recorded by the charity for this campaign yet.
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {usages.map((u) => (
                <EvidenceCard key={u.usageId} usage={u} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'charity' && (
        <div className="card" style={{ maxWidth: '700px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
            Charity Verification Profile
          </h3>

          {campaign.charity ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Organization Name</span>
                <span style={{ fontWeight: '700', color: '#ffffff' }}>{campaign.charity.organizationName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registration Number</span>
                <span className="font-mono" style={{ color: '#ffffff' }}>{campaign.charity.registrationNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Official Email</span>
                <span style={{ color: '#ffffff' }}>{campaign.charity.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Wallet Address</span>
                <span className="font-mono" style={{ color: '#93c5fd' }}>{campaign.charity.walletAddress}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Registration Date</span>
                <span>{formatDate(campaign.charity.registeredAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Blockchain Status</span>
                <span className="badge badge-verified">Verified & Authorized</span>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>Charity information not available.</p>
          )}
        </div>
      )}

      {/* Donation Modal */}
      {isDonating && (
        <DonationModal
          campaign={campaign}
          isOpen={true}
          onClose={() => setIsDonating(false)}
          onDonationSuccess={() => loadAllDetails()}
        />
      )}
    </div>
  );
}
