import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatInr, ethToInr } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import WalletButton from '../components/WalletButton';
import {
  Building2,
  ShieldCheck,
  PlusCircle,
  TrendingUp,
  FileCheck2,
  Lock,
  Layers,
  Heart,
  Upload,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

export default function CharityDashboard() {
  const { charityProfile, isCharity, switchRole } = useAuth();

  useEffect(() => {
    if (!isCharity && switchRole) {
      switchRole('charity');
    }
  }, [isCharity, switchRole]);

  const [stats, setStats] = useState({
    totalCampaigns: 1,
    activeCampaigns: 1,
    completedCampaigns: 0,
    totalDonationsInr: 502500,
    totalFundsRaisedInr: 502500,
    evidenceUploaded: 1,
    evidenceVerified: 1,
    evidenceFailed: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const isVerified = charityProfile.verificationStatus === 'VERIFIED';

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [statsRes, campsRes] = await Promise.all([
          api.getStats().catch(() => null),
          api.getCampaigns().catch(() => ({ campaigns: [] })),
        ]);

        if (statsRes?.stats) {
          const raisedEth = parseFloat(statsRes.stats.totalRaisedEth || '2.01');
          setStats({
            totalCampaigns: statsRes.stats.totalCampaigns || 1,
            activeCampaigns: statsRes.stats.activeCampaigns || 1,
            completedCampaigns: statsRes.stats.completedCampaigns || 0,
            totalDonationsInr: Math.round(raisedEth * 250000),
            totalFundsRaisedInr: Math.round(raisedEth * 250000),
            evidenceUploaded: 1,
            evidenceVerified: 1,
            evidenceFailed: 0,
          });
        }
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Querying charity dashboard metrics..." />;
  }

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
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '9999px',
            background: isVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            color: isVerified ? '#34d399' : '#fbbf24',
            fontSize: '0.75rem',
            fontWeight: '700',
            marginBottom: '0.4rem',
          }}>
            <Building2 size={13} />
            <span>{charityProfile.organizationName}</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff' }}>
            Charity Operations Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage transparent campaigns, disburse funds, and anchor proof of expenditure to IPFS.
          </p>
        </div>

        {/* Action Controls: Wallet Connection & Create Campaign */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <WalletButton />

          <Link
            to="/charity/campaigns/create"
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <PlusCircle size={16} />
            <span>Create Campaign</span>
          </Link>
        </div>
      </div>

      {/* Charity MetaMask Wallet Status Card */}
      <div className="card" style={{
        padding: '1.25rem 1.5rem',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(226, 118, 37, 0.15)',
            border: '1px solid rgba(226, 118, 37, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Wallet size={22} color="#fb923c" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>
                Charity Organization Wallet
              </span>
              <span style={{
                fontSize: '0.68rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontWeight: '700',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                MetaMask On-Chain Signer
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
              Connect your authorized organization wallet to approve campaigns, sign evidence records, and anchor expenditures on-chain.
            </p>
          </div>
        </div>

        <div>
          <WalletButton />
        </div>
      </div>

      {/* Verification Status Banner */}
      <div className="card" style={{
        padding: '1.5rem 1.75rem',
        border: isVerified
          ? '1px solid rgba(16, 185, 129, 0.4)'
          : '1px solid rgba(245, 158, 11, 0.4)',
        background: isVerified
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)'
          : 'rgba(15, 23, 42, 0.8)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {isVerified ? <CheckCircle2 size={28} color="#34d399" /> : <AlertTriangle size={28} color="#fbbf24" />}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                  {isVerified ? '✓ Verified Charity' : '⚠ Verification Required'}
                </h3>
                <StatusBadge type="charity" status={charityProfile.verificationStatus} size="sm" />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {isVerified
                  ? '✓ Campaign Creation Enabled: Credential hash validated on CharityRegistry.sol'
                  : 'Campaign creation is locked until credential hash is recorded on blockchain.'}
              </p>
            </div>
          </div>

          <Link
            to="/charity/verification"
            className="btn btn-secondary btn-sm"
          >
            <span>View Verification Record</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid-4">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Raised (₹)</span>
            <Heart size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            {formatInr(stats.totalFundsRaisedInr)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.35rem' }}>
            Direct UPI & ₹ Inflows
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Campaigns</span>
            <TrendingUp size={18} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            {stats.totalCampaigns}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.35rem' }}>
            {stats.activeCampaigns} Active • {stats.completedCampaigns} Completed
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Evidence Uploaded</span>
            <FileCheck2 size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            {stats.evidenceUploaded}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.35rem' }}>
            Pinned to IPFS
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Evidence Verified</span>
            <ShieldCheck size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
            {stats.evidenceVerified} / {stats.evidenceUploaded}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a855f7', marginTop: '0.35rem' }}>
            {stats.evidenceFailed} Hash Failures
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid-3">
        <Link
          to="/charity/campaigns"
          className="card card-interactive"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
          }}>
            <TrendingUp size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>
            Manage Campaigns
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Review campaign progress, donor lists, and initiate expenditure withdrawals.
          </p>
        </Link>

        <Link
          to="/charity/evidence"
          className="card card-interactive"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#06b6d4',
          }}>
            <Upload size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>
            Upload Proof to IPFS
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Submit bills, receipts, and utilization photos to generate tamper-evident hashes.
          </p>
        </Link>

        <Link
          to="/charity/funds"
          className="card card-interactive"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
          }}>
            <Layers size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff' }}>
            Fund Utilization
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Log categorized fund disbursements with attached IPFS evidence references.
          </p>
        </Link>
      </div>
    </div>
  );
}
