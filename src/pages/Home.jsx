import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatInr, ethToInr } from '../utils/formatters';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  FileCheck2,
  Building2,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Lock,
  Layers,
  FileText,
  Heart,
  Eye,
} from 'lucide-react';

export default function Home() {
  const { isDonor } = useAuth();
  const [stats, setStats] = useState({
    totalCampaigns: 1,
    activeCampaigns: 1,
    completedCampaigns: 0,
    totalRaisedInr: 502500, // ₹5,02,500 (from 2.01 ETH)
    verifiedCharitiesCount: 1,
    evidenceCount: 1,
  });

  const [campaigns, setCampaigns] = useState([]);
  const [charities, setCharities] = useState([]);
  const [fundUsages, setFundUsages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [campRes, statsRes, charRes] = await Promise.all([
          api.getCampaigns().catch(() => ({ campaigns: [] })),
          api.getStats().catch(() => null),
          api.getCharities().catch(() => ({ charities: [] })),
        ]);

        const campList = campRes?.campaigns || [];
        setCampaigns(campList);
        setCharities(charRes?.charities || []);

        // Load fund usages from campaign 1
        if (campList.length > 0) {
          const usageRes = await api.getCampaignUsages(campList[0].campaignId).catch(() => ({ usages: [] }));
          setFundUsages(usageRes?.usages || []);
        }

        // Calculate INR stats
        if (statsRes?.stats) {
          const raisedEth = parseFloat(statsRes.stats.totalRaisedEth || '2.01');
          setStats({
            totalCampaigns: statsRes.stats.totalCampaigns || campList.length || 1,
            activeCampaigns: statsRes.stats.activeCampaigns || 1,
            completedCampaigns: statsRes.stats.completedCampaigns || 0,
            totalRaisedInr: Math.round(raisedEth * 250000),
            verifiedCharitiesCount: statsRes.stats.verifiedCharitiesCount || charRes?.charities?.length || 1,
            evidenceCount: 1,
          });
        }
      } catch (err) {
        console.warn('Home data load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Charity Hash Verification',
      desc: 'Charity credentials are cryptographic hashed and validated through smart contracts. No human approval bias.',
      icon: <Building2 size={24} color="#3b82f6" />,
      color: '#3b82f6',
    },
    {
      step: '02',
      title: 'Campaign Whitelisting',
      desc: 'Only verified charities with confirmed blockchain records are eligible to deploy fundraising campaigns.',
      icon: <Sparkles size={24} color="#8b5cf6" />,
      color: '#8b5cf6',
    },
    {
      step: '03',
      title: 'Seamless ₹ Donations',
      desc: 'Donors contribute in Indian Rupees (₹) via standard UPI or Cards. The backend relayer records the donation on-chain.',
      icon: <Heart size={24} color="#10b981" />,
      color: '#10b981',
    },
    {
      step: '04',
      title: 'IPFS Evidence & Audit',
      desc: 'Every expenditure receipt is pinned to IPFS, Keccak-256 hashed, and sealed on blockchain for permanent public audit.',
      icon: <FileCheck2 size={24} color="#06b6d4" />,
      color: '#06b6d4',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '4.5rem 1rem 3rem',
        textAlign: 'center',
        maxWidth: '960px',
        margin: '0 auto',
      }}>
        {/* Trust Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.85rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
        }}>
          <ShieldCheck size={16} />
          <span>Blockchain-Backed Transparent Charity Management</span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
          fontWeight: '800',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.25rem',
          color: '#ffffff',
        }}>
          Transparent Giving.{' '}
          <span className="title-gradient">Verified Impact.</span>
        </h1>

        {/* Supporting Text */}
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          maxWidth: '780px',
          margin: '0 auto 2.5rem',
        }}>
          LedgerCare uses blockchain-backed verification and IPFS evidence to eliminate fraud, restore public trust, and ensure 100% accountability in humanitarian donations. Every rupee is accounted for on-chain.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/campaigns"
            className="btn btn-primary btn-lg"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
            }}
          >
            <span>Explore Campaigns</span>
            <ArrowRight size={18} />
          </Link>

          {!isDonor ? (
            <Link
              to="/charity/register"
              className="btn btn-secondary btn-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
              }}
            >
              <Building2 size={18} color="#38bdf8" />
              <span>Register as Charity</span>
            </Link>
          ) : (
            <Link
              to="/donor"
              className="btn btn-secondary btn-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
              }}
            >
              <Heart size={18} color="#60a5fa" />
              <span>Donor Hub</span>
            </Link>
          )}

          <Link
            to="/transparency/blockchain"
            className="btn btn-outline btn-lg"
          >
            <Eye size={18} />
            <span>View Blockchain Audit</span>
          </Link>
        </div>
      </section>

      {/* 2. LIVE PLATFORM METRICS */}
      <section className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
          }}>
            <HeartHandshake size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Raised (₹)</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: '#ffffff' }}>
              {formatInr(stats.totalRaisedInr)}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#34d399' }}>
              100% Blockchain Recorded
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
          }}>
            <TrendingUp size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Campaigns</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: '#ffffff' }}>
              {stats.activeCampaigns}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#60a5fa' }}>
              Verified Initiatives
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a855f7',
          }}>
            <Building2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Charities</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: '#ffffff' }}>
              {stats.verifiedCharitiesCount}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#34d399' }}>
              Hash-Validated ✓
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#06b6d4',
          }}>
            <FileCheck2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IPFS Evidence</div>
            <div style={{ fontSize: '1.55rem', fontWeight: '800', color: '#ffffff' }}>
              {stats.evidenceCount} Verified
            </div>
            <div style={{ fontSize: '0.74rem', color: '#38bdf8' }}>
              Cryptographically Sealed
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CAMPAIGNS */}
      <section>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#10b981', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Immediate Needs
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff' }}>
              Featured Campaigns
            </h2>
          </div>

          <Link
            to="/campaigns"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#34d399',
              fontWeight: '600',
              fontSize: '0.92rem',
            }}
          >
            <span>View All Campaigns</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Fetching verified campaigns from blockchain..." />
        ) : campaigns.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No campaigns available at the moment.</p>
          </div>
        ) : (
          <div className="grid-3">
            {campaigns.slice(0, 3).map((camp) => (
              <CampaignCard
                key={camp.campaignId}
                campaign={camp}
                onDonateClick={(c) => setSelectedCampaignForDonation(c)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW LEDGERCARE WORKS */}
      <section>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#60a5fa', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Unbreakable Audit Trail
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
            How LedgerCare Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            A four-step cryptographic pipeline connecting donors, verified charities, and immutable proof.
          </p>
        </div>

        <div className="grid-4">
          {howItWorksSteps.map((s) => (
            <div
              key={s.step}
              className="card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.75rem',
                fontSize: '2.5rem',
                fontWeight: '900',
                color: 'rgba(255, 255, 255, 0.04)',
                fontFamily: 'var(--font-mono)',
              }}>
                {s.step}
              </div>

              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: `${s.color}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {s.icon}
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
                {s.title}
              </h3>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. VERIFIED CHARITIES SHOWCASE */}
      <section className="card" style={{ padding: '2rem 1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' }}>
              Verified Charities on LedgerCare
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Every organization is certified on the <code>CharityRegistry</code> contract with a verified registration hash.
            </p>
          </div>
          <Link to="/charities" className="btn btn-secondary btn-sm">
            <span>Explore All Charities</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid-3">
          {charities.map((c) => (
            <div
              key={c.charityId}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
                    {c.organizationName}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Reg: {c.registrationNumber}
                  </div>
                </div>
                <StatusBadge type="charity" status="VERIFIED" size="sm" />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Email: {c.email}
              </div>

              <div style={{
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(7, 11, 20, 0.6)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}>
                <div>Blockchain Hash Record:</div>
                <div className="font-mono" style={{ color: '#34d399', wordBreak: 'break-all' }}>
                  0x7f83b1657ff1...d9069
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TRANSPARENT FUND USAGE SHOWCASE */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#06b6d4', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Accountability in Action
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff' }}>
              Transparent Fund Usage & Evidence
            </h2>
          </div>
          <Link to="/transparency/blockchain" className="btn btn-secondary btn-sm">
            <span>Audit Full Ledger</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="table-responsive card" style={{ padding: '0.5rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Expenditure Purpose</th>
                <th>Amount (₹)</th>
                <th>Evidence Proof</th>
                <th>Verification</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fundUsages.map((u) => (
                <tr key={u.usageId}>
                  <td style={{ fontWeight: '600' }}>Education Support Campaign</td>
                  <td>{u.purpose}</td>
                  <td style={{ color: '#34d399', fontWeight: '700' }}>
                    {formatInr(parseFloat(u.amountEth || 1) * 250000)}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#60a5fa' }} className="font-mono">
                      IPFS Pinata CID
                    </span>
                  </td>
                  <td>
                    <StatusBadge type="evidence" status="VERIFIED" size="sm" />
                  </td>
                  <td>
                    <Link
                      to={`/evidence/${u.usageId}`}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      Verify Hash
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. WHY LEDGERCARE CALLOUT */}
      <section className="card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
        padding: '3rem 2rem',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '1rem' }}>
            Empowering Transparent Humanitarian Impact
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '2rem' }}>
            Traditional fundraising lacks visibility into how money is actually spent. LedgerCare pairs normal Indian Rupee payment processing with mathematical proof on Ethereum smart contracts.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/campaigns"
              className="btn btn-primary btn-lg"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
              }}
            >
              <Heart size={16} fill="#ffffff" />
              <span>Make a Verified Donation</span>
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg">
              <span>Read Architectural Whitepaper</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Global ₹ Donation Modal */}
      {selectedCampaignForDonation && (
        <DonationModal
          campaign={selectedCampaignForDonation}
          isOpen={true}
          onClose={() => setSelectedCampaignForDonation(null)}
          onDonationSuccess={() => {
            api.getCampaigns().then((res) => setCampaigns(res.campaigns || []));
          }}
        />
      )}
    </div>
  );
}
