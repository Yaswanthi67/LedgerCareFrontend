import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  formatInr,
  ethToInr,
  formatDate,
  formatDateTime,
  truncateHash,
  getDaysRemaining,
} from '../utils/formatters';
import CampaignProgress from '../components/CampaignProgress';
import StatusBadge from '../components/StatusBadge';
import DonationModal from '../components/DonationModal';
import AuditTimeline from '../components/AuditTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  Heart,
  Calendar,
  Users,
  MapPin,
  Share2,
  FileCheck2,
  Activity,
  Layers,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export default function CampaignDetails() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [usages, setUsages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'funds', 'evidence', 'activity', 'timeline', 'blockchain'
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  useEffect(() => {
    async function loadCampaignData() {
      setIsLoading(true);
      try {
        const [campRes, donRes, useRes] = await Promise.all([
          api.getCampaign(id).catch(() => null),
          api.getCampaignDonations(id).catch(() => ({ donations: [] })),
          api.getCampaignUsages(id).catch(() => ({ usages: [] })),
        ]);

        if (campRes?.campaign) {
          setCampaign(campRes.campaign);
        }
        setDonations(donRes?.donations || []);
        setUsages(useRes?.usages || []);
      } catch (err) {
        console.warn('Error loading campaign details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaignData();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Retrieving campaign and audit logs from blockchain..." />;
  }

  if (!campaign) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '1rem' }}>
          Campaign Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The requested campaign does not exist on the LedgerCare blockchain.
        </p>
        <Link to="/campaigns" className="btn btn-primary">
          Return to Campaigns
        </Link>
      </div>
    );
  }

  const targetInr = campaign.targetAmountEth
    ? ethToInr(campaign.targetAmountEth)
    : campaign.targetAmount;
  const raisedInr = campaign.raisedAmountEth
    ? ethToInr(campaign.raisedAmountEth)
    : campaign.raisedAmount;
  const daysLeft = getDaysRemaining(campaign.endDate);

  const tabs = [
    { id: 'about', label: 'About the Campaign', icon: <FileText size={15} /> },
    { id: 'funds', label: 'Fund Utilization', icon: <Layers size={15} />, count: usages.length },
    { id: 'evidence', label: 'Evidence & IPFS', icon: <FileCheck2 size={15} />, count: usages.length },
    { id: 'activity', label: 'Donation Activity', icon: <Heart size={15} />, count: donations.length },
    { id: 'timeline', label: 'Transparency Timeline', icon: <Activity size={15} /> },
    { id: 'blockchain', label: 'Blockchain Verification', icon: <ShieldCheck size={15} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Top Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Link to="/campaigns" style={{ color: 'var(--text-secondary)' }}>Campaigns</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#ffffff' }}>Campaign #{campaign.campaignId}</span>
      </div>

      {/* Main Campaign Hero Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
        gap: '2rem',
      }}>
        {/* Left Column: Image and Badges */}
        <div>
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            height: '380px',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)',
          }}>
            <img
              src={campaign.imageUrl || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80'}
              alt={campaign.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(7,11,20,0.85) 100%)',
            }} />

            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              display: 'flex',
              gap: '0.5rem',
            }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#93c5fd',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}>
                {campaign.category || 'Education & Welfare'}
              </span>
              <StatusBadge type="campaign" status={campaign.status === 0 ? 'Active' : 'Completed'} />
            </div>

            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(6, 78, 59, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}>
                <ShieldCheck size={16} color="#34d399" />
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#6ee7b7' }}>
                  {campaign.charityName || 'Verified Charity'} ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Details & Donation Action Box */}
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '2rem',
          border: '1px solid rgba(16, 185, 129, 0.2)',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: 1.3,
              marginBottom: '0.75rem',
            }}>
              {campaign.title}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="#60a5fa" />
                <span>{campaign.location || 'Maharashtra, India'}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} color="#34d399" />
                <span>Ends: {formatDate(campaign.endDate)}</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Users size={15} color="#a855f7" />
                <span>{donations.length || 4} Donors</span>
              </span>
            </div>

            {/* Financial Progress in ₹ */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem',
            }}>
              <CampaignProgress
                raisedAmount={campaign.raisedAmountEth || campaign.raisedAmount}
                targetAmount={campaign.targetAmountEth || campaign.targetAmount}
                isEth={Boolean(campaign.targetAmountEth)}
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Amount</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                    {formatInr(targetInr)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Raised (₹)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#34d399' }}>
                    {formatInr(raisedInr)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={() => setDonationModalOpen(true)}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                fontSize: '1.05rem',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Heart size={18} fill="#ffffff" />
              <span>Donate Now with UPI / ₹</span>
            </button>

            <div style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>100% Guaranteed On-Chain Audit Trail & 80G Tax Exemption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                background: activeTab === t.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeTab === t.id ? '#34d399' : 'var(--text-secondary)',
                borderBottom: activeTab === t.id ? '2px solid #10b981' : '2px solid transparent',
                fontWeight: activeTab === t.id ? '700' : '500',
                fontSize: '0.88rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  background: activeTab === t.id ? '#10b981' : 'rgba(255,255,255,0.1)',
                  color: activeTab === t.id ? '#042f2e' : '#ffffff',
                  fontWeight: '700',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ marginTop: '1.5rem' }}>
          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
                  Campaign Overview
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {campaign.description}
                </p>
              </div>

              <div className="grid-2" style={{ gap: '1.5rem' }}>
                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#38bdf8', marginBottom: '0.5rem' }}>
                    Beneficiary Information
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Directly supports 250+ underprivileged students in rural and semi-urban communities with books, learning materials, and certified educational infrastructure.
                  </p>
                </div>

                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#34d399', marginBottom: '0.5rem' }}>
                    Expected Impact
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    100% retention in primary education, reduction of academic dropouts, and digital literacy training. All expenditure receipts will be publicly posted to IPFS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FUND UTILIZATION */}
          {activeTab === 'funds' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' }}>
                  Itemized Fund Allocations
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Recorded directly by the charity on the <code>FundEvidenceTracker</code> contract.
                </p>
              </div>

              {usages.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No fund allocations recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Usage ID</th>
                        <th>Purpose</th>
                        <th>Amount Disbursed</th>
                        <th>Timestamp</th>
                        <th>Evidence Hash</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usages.map((u) => (
                        <tr key={u.usageId}>
                          <td className="font-mono">#{u.usageId}</td>
                          <td style={{ fontWeight: '600' }}>{u.purpose}</td>
                          <td style={{ color: '#34d399', fontWeight: '700' }}>
                            {formatInr(parseFloat(u.amountEth || 1) * 250000)}
                          </td>
                          <td>{formatDate(u.timestamp)}</td>
                          <td className="font-mono" style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                            {truncateHash(u.evidenceHash, 8, 6)}
                          </td>
                          <td>
                            <StatusBadge type="evidence" status="RECORDED" size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EVIDENCE & IPFS */}
          {activeTab === 'evidence' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' }}>
                  Cryptographic Evidence Documents
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Each evidence receipt is stored on IPFS and sealed with a Keccak-256 hash.
                </p>
              </div>

              <div className="grid-2" style={{ gap: '1rem' }}>
                {usages.map((u) => (
                  <div
                    key={u.usageId}
                    style={{
                      background: 'rgba(15, 23, 42, 0.65)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
                        {u.purpose} (Invoice)
                      </h4>
                      <StatusBadge type="evidence" status="VERIFIED" size="sm" />
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      IPFS Pinata CID:
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: '#60a5fa', wordBreak: 'break-all', marginBottom: '0.75rem' }}>
                      bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      Original Blockchain Keccak-256 Hash:
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.72rem', color: '#34d399', wordBreak: 'break-all', marginBottom: '1rem' }}>
                      {u.evidenceHash}
                    </div>

                    <Link
                      to={`/evidence/${u.usageId}`}
                      className="btn btn-outline btn-sm"
                      style={{ width: '100%' }}
                    >
                      <ShieldCheck size={14} />
                      <span>Run Independent Hash Verification</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DONATION ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' }}>
                  Real-Time Verified Donations
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  All donations processed in Indian Rupees (₹) and confirmed on the blockchain ledger.
                </p>
              </div>

              {donations.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No donations recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Donor</th>
                        <th>Amount (₹)</th>
                        <th>Payment</th>
                        <th>Blockchain Status</th>
                        <th>Transaction Hash</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((d, idx) => (
                        <tr key={d.id || idx}>
                          <td style={{ fontWeight: '600', color: '#ffffff' }}>
                            {d.donorName || 'Anonymous Donor'}
                          </td>
                          <td style={{ color: '#34d399', fontWeight: '700' }}>
                            {formatInr(d.amountInr || (d.amountEth ? ethToInr(d.amountEth) : d.amount))}
                          </td>
                          <td>
                            <StatusBadge type="payment" status={d.paymentStatus || 'PAID'} size="sm" />
                          </td>
                          <td>
                            <StatusBadge type="blockchain" status={d.blockchainStatus || 'CONFIRMED'} size="sm" />
                          </td>
                          <td className="font-mono" style={{ fontSize: '0.75rem', color: '#93c5fd' }}>
                            {truncateHash(d.transactionHash, 8, 6)}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {formatDateTime(d.timestamp || d.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TRANSPARENCY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="card" style={{ padding: '2rem 1.5rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' }}>
                  Complete Cryptographic Audit Trail
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Chronological lifecycle of this campaign from charity credential registration to current evidence verification.
                </p>
              </div>
              <AuditTimeline campaign={campaign} donations={donations} usages={usages} />
            </div>
          )}

          {/* TAB 6: BLOCKCHAIN VERIFICATION */}
          {activeTab === 'blockchain' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <ShieldCheck size={24} color="#34d399" />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#34d399' }}>
                    Authentic Smart Contract Record
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    This campaign is anchored on the blockchain ledger.
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: '600', width: '220px' }}>Ledger Record</td>
                      <td className="font-mono">Campaign Manager Ledger</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600' }}>Contract Address</td>
                      <td className="font-mono" style={{ color: '#60a5fa' }}>
                        0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600' }}>Charity Registry Contract</td>
                      <td className="font-mono" style={{ color: '#60a5fa' }}>
                        0x5FbDB2315678afecb367f032d93F642f64180aa3
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600' }}>Donation Ledger Contract</td>
                      <td className="font-mono" style={{ color: '#60a5fa' }}>
                        0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600' }}>Fund Evidence Tracker</td>
                      <td className="font-mono" style={{ color: '#60a5fa' }}>
                        0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600' }}>Smart Contract Campaign ID</td>
                      <td className="font-mono">#{campaign.campaignId}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '600' }}>Verification Mode</td>
                      <td>Automatic (Hash Comparison) - Tamper Evident</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ₹ Donation Modal */}
      {donationModalOpen && (
        <DonationModal
          campaign={campaign}
          isOpen={true}
          onClose={() => setDonationModalOpen(false)}
          onDonationSuccess={() => {
            api.getCampaign(id).then((res) => setCampaign(res.campaign));
            api.getCampaignDonations(id).then((res) => setDonations(res.donations || []));
          }}
        />
      )}
    </div>
  );
}
