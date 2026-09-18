import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { fetchPlatformStats, fetchAllCampaigns } from '../services/blockchain';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Lock,
  FileCheck2,
  Building2,
  HeartHandshake,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const { activeProvider, account, connectWallet } = useWallet();

  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalRaisedEth: '0',
    totalWithdrawnEth: '0',
    verifiedCharitiesCount: 0,
  });
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!activeProvider) return;
      setIsLoading(true);
      try {
        const [statsData, allCamps] = await Promise.all([
          fetchPlatformStats(activeProvider),
          fetchAllCampaigns(activeProvider),
        ]);
        setStats(statsData);
        // Prioritize active campaigns for featured preview
        const active = allCamps.filter((c) => c.status === 0).slice(0, 3);
        setFeaturedCampaigns(active.length > 0 ? active : allCamps.slice(0, 3));
      } catch (err) {
        console.warn('Failed to load home page data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeProvider]);

  const workflowSteps = [
    {
      num: '01',
      title: 'Charity Verification',
      desc: 'Only pre-authorized charities with valid registration credentials can register on-chain.',
      icon: <Building2 size={22} color="#60a5fa" />,
    },
    {
      num: '02',
      title: 'Campaign Creation',
      desc: 'Verified charities deploy targeted fundraising campaigns with strict financial caps and dates.',
      icon: <Sparkles size={22} color="#a855f7" />,
    },
    {
      num: '03',
      title: 'Direct Donations',
      desc: 'Donors contribute ETH directly via DonationLedger smart contract with zero intermediary fees.',
      icon: <HeartHandshake size={22} color="#ec4899" />,
    },
    {
      num: '04',
      title: 'Fund Usage & Evidence',
      desc: 'Charities withdraw funds and must upload receipts, bills, and proof of expenditure to IPFS.',
      icon: <FileCheck2 size={22} color="#06b6d4" />,
    },
    {
      num: '05',
      title: 'Cryptographic Audit',
      desc: 'Keccak-256 hashes seal the evidence forever. Anyone can verify document integrity on-chain.',
      icon: <ShieldCheck size={22} color="#10b981" />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '4rem 1rem 3rem',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.9rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
        }}>
          <ShieldCheck size={16} color="#818cf8" />
          <span>Ethereum Smart Contracts • Decentralized Trust</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: '800',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem',
          color: '#ffffff',
        }}>
          Transparent Charity.{' '}
          <span className="title-gradient">Verified on Blockchain.</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          marginBottom: '2.25rem',
          maxWidth: '750px',
          margin: '0 auto 2.25rem',
        }}>
          LedgerCare eliminates fraud and ambiguity in humanitarian giving. Every charity is cryptographically verified, every donation is recorded immutably, and fund usage evidence is anchored to IPFS and smart contracts.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/campaigns" className="btn btn-primary btn-lg">
            <span>Explore Campaigns</span>
            <ArrowRight size={18} />
          </Link>
          {!account && (
            <button onClick={connectWallet} className="btn btn-secondary btn-lg">
              <span>Connect Wallet</span>
            </button>
          )}
          <Link to="/verify" className="btn btn-secondary btn-lg">
            <span>Verify Evidence</span>
          </Link>
        </div>
      </section>

      {/* Real Blockchain Stats Grid */}
      <section className="grid-4">
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
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Campaigns</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
              {stats.totalCampaigns}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
              {stats.activeCampaigns} Active Now
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a855f7',
          }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Raised</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
              {parseFloat(stats.totalRaisedEth).toFixed(2)} ETH
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              100% On-Chain
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#06b6d4',
          }}>
            <FileCheck2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Funds Disbursed</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
              {parseFloat(stats.totalWithdrawnEth).toFixed(2)} ETH
            </div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
              Documented & Tracked
            </div>
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
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Charities</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
              {stats.verifiedCharitiesCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
              Registry Validated
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Workflow Section */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
            How LedgerCare Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            An unbreakable cryptographic chain from verification to expenditure audit.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
        }}>
          {workflowSteps.map((s, idx) => (
            <div key={s.num} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: '1rem',
                fontSize: '2rem',
                fontWeight: '900',
                color: 'rgba(255, 255, 255, 0.04)',
                fontFamily: 'var(--font-mono)',
              }}>
                {s.num}
              </div>
              <div style={{ marginBottom: '1rem' }}>{s.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.45rem' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Active Campaigns Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem' }}>
              Active Campaigns
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Support vetted charity campaigns backed by on-chain guarantees.
            </p>
          </div>
          <Link
            to="/campaigns"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: '#60a5fa',
              fontSize: '0.9rem',
              fontWeight: '600',
            }}
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Querying active campaigns from blockchain..." />
        ) : featuredCampaigns.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No campaigns found on this network yet.</p>
            <Link to="/charity" className="btn btn-secondary">
              Deploy First Campaign in Charity Portal
            </Link>
          </div>
        ) : (
          <div className="grid-3">
            {featuredCampaigns.map((camp) => (
              <CampaignCard
                key={camp.campaignId}
                campaign={camp}
                onDonateClick={(c) => setSelectedCampaignForDonation(c)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Why Blockchain? Section */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)',
        padding: '3rem 2rem',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '1rem' }}>
            Why Trust Blockchain for Humanitarian Aid?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Traditional charity platforms act as centralized black boxes where 30-50% of funds can be siphoned into overhead or unaccountable channels. LedgerCare enforces complete transparency at the code level.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.2rem' }}>
                  Immutable Ledger
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Donations cannot be altered, hidden, or rewritten by any administrator.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.2rem' }}>
                  Direct P2P Settlement
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Funds deposit directly into the smart contract; 100% of donations are accounted for.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.2rem' }}>
                  Cryptographic Proof
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Every receipt is hashed with Keccak-256 and verified against on-chain records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Donation Modal */}
      {selectedCampaignForDonation && (
        <DonationModal
          campaign={selectedCampaignForDonation}
          isOpen={true}
          onClose={() => setSelectedCampaignForDonation(null)}
          onDonationSuccess={() => {
            // refresh data
            fetchPlatformStats(activeProvider).then(setStats);
            fetchAllCampaigns(activeProvider).then((camps) => {
              const active = camps.filter((c) => c.status === 0).slice(0, 3);
              setFeaturedCampaigns(active.length > 0 ? active : camps.slice(0, 3));
            });
          }}
        />
      )}
    </div>
  );
}
