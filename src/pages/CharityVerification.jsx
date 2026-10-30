import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Lock,
  Building2,
  Layers,
  Copy,
  Check,
} from 'lucide-react';

export default function CharityVerification() {
  const { charityProfile, updateCharityStatus } = useAuth();
  const [profile, setProfile] = useState(
    charityProfile || {
      id: 1,
      organizationName: 'Charity Organization',
      registrationNumber: 'LC-REG',
      email: '',
      verified: false,
      verificationStatus: 'PENDING_VERIFICATION',
      campaignEligibility: 'BLOCKED',
      hash: '0x' + '0'.repeat(64),
    }
  );
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadVerification() {
      setIsLoading(true);
      try {
        const charityId = profile?.id || 1;
        const res = await api.getCharityVerification(charityId);
        if (res.success) {
          setProfile((prev) => ({
            ...prev,
            ...res.charity,
            verificationStatus: res.verificationStatus || prev?.verificationStatus,
            campaignEligibility: res.campaignEligibility || prev?.campaignEligibility,
            hash: res.hash || prev?.hash,
          }));
        }
      } catch (err) {
        console.warn('Could not refresh verification status from API:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadVerification();
  }, [profile?.id]);

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const isPending = profile?.verificationStatus === 'PENDING_VERIFICATION';
  const isFailed = profile?.verificationStatus === 'VERIFICATION_FAILED';

  const copyHash = () => {
    navigator.clipboard.writeText(profile.hash || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <LoadingSpinner message="Checking blockchain verification records for charity..." />;
  }

  return (
    <div style={{ maxWidth: '780px', margin: '1.5rem auto 3rem', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.8rem',
          borderRadius: '9999px',
          background: isVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          color: isVerified ? '#34d399' : '#fbbf24',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '0.85rem',
        }}>
          <ShieldCheck size={14} />
          <span>Automated Hash-Based Verification Engine</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
          Charity Verification
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Cryptographic hash matching between NGO credentials and <code>CharityRegistry.sol</code> on-chain records.
        </p>
      </div>

      {/* Verification Status Banner */}
      <div className="card" style={{
        padding: '2rem',
        border: isVerified
          ? '1px solid rgba(16, 185, 129, 0.4)'
          : isPending
          ? '1px solid rgba(245, 158, 11, 0.4)'
          : '1px solid rgba(244, 63, 94, 0.4)',
        background: isVerified
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)'
          : 'rgba(15, 23, 42, 0.8)',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isVerified
              ? 'rgba(16, 185, 129, 0.15)'
              : isPending
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isVerified ? (
              <CheckCircle2 size={32} color="#34d399" />
            ) : isPending ? (
              <AlertTriangle size={32} color="#fbbf24" />
            ) : (
              <XCircle size={32} color="#fb7185" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
                {isVerified ? 'Charity Verified ✓' : isPending ? 'Pending Hash Verification' : 'Verification Failed ✕'}
              </h2>
              <StatusBadge type="charity" status={profile.verificationStatus} size="sm" />
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {isVerified ? (
                <span>
                  The credential hash matches the on-chain registration on <code>CharityRegistry.sol</code>. Campaign creation is unlocked.
                </span>
              ) : (
                <span>
                  Your charity must complete blockchain hash verification before creating campaigns.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Verification Checklist */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(7, 11, 20, 0.6)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1. Charity Status</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: isVerified ? '#34d399' : '#fbbf24' }}>
              {isVerified ? '✓ Verified Charity' : 'Pending Verification'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>2. Blockchain Record</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: isVerified ? '#34d399' : '#94a3b8' }}>
              {isVerified ? '✓ Record Found' : 'Searching Ledger...'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>3. Campaign Eligibility</div>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: isVerified ? '#34d399' : '#f43f5e' }}>
              {isVerified ? '✓ Creation Enabled' : '✕ Creation Disabled'}
            </div>
          </div>
        </div>
      </div>

      {/* Details Table */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Registered Organization Details
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Organization</span>
            <strong style={{ color: '#ffffff', fontSize: '0.92rem' }}>{profile.organizationName}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Registration Number</span>
            <span className="font-mono" style={{ color: '#ffffff', fontSize: '0.88rem' }}>{profile.registrationNumber}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Official Email</span>
            <span style={{ color: '#93c5fd', fontSize: '0.88rem' }}>{profile.email}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Blockchain Record Status</span>
            <StatusBadge type="blockchain" status={isVerified ? 'RECORDED' : 'PENDING'} size="sm" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Campaign Creation Eligibility</span>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: '700',
              color: isVerified ? '#34d399' : '#f43f5e',
            }}>
              {isVerified ? 'Allowed ✓' : 'Blocked ✕'}
            </span>
          </div>

          <div style={{ paddingTop: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Generated Credential Keccak-256 Hash:
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(7, 11, 20, 0.75)',
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <span className="font-mono" style={{ fontSize: '0.76rem', color: '#34d399', wordBreak: 'break-all' }}>
                {profile.hash}
              </span>
              <button
                onClick={copyHash}
                style={{ background: 'transparent', border: 'none', color: copied ? '#34d399' : '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                title="Copy Hash"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button: Strictly Enforced */}
      <div style={{ textAlign: 'center' }}>
        {isVerified ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/charity/campaigns/create"
              className="btn btn-primary btn-lg"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Create Campaign</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/charity/dashboard" className="btn btn-secondary btn-lg">
              <span>Go to Charity Dashboard</span>
            </Link>
          </div>
        ) : (
          <div>
            <button
              disabled={true}
              className="btn btn-secondary btn-lg"
              style={{ opacity: 0.5, cursor: 'not-allowed', width: '100%', maxWidth: '420px', margin: '0 auto' }}
            >
              <Lock size={16} />
              <span>Campaign Creation Disabled</span>
            </button>
            <p style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: '0.75rem' }}>
              Your charity must complete blockchain hash verification before creating campaigns.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
