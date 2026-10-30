import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatInr, formatDate, formatDateTime, truncateHash } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import {
  CheckCircle2,
  ShieldCheck,
  Receipt,
  Eye,
  ArrowRight,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

export default function DonationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const donation = location.state?.donation || {
    campaignTitle: 'Education Support Campaign',
    charityName: 'LedgerCare Demo Charity',
    amountInr: 1000,
    donorName: user?.name || 'Valued Donor',
    orderId: 'order_demo_12345',
    donationId: 4,
    transactionHash: '0xd6fbbbacec62efb5b1b659e876697aee98bef1e8cf7decd04aaae8d9d0d2be0c',
    blockNumber: 108,
    date: Date.now(),
    paymentStatus: 'PAID',
    blockchainStatus: 'CONFIRMED',
  };

  const copyTxHash = () => {
    navigator.clipboard.writeText(donation.transactionHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{
        padding: '2.5rem 2rem',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
      }}>
        {/* Success Icon */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <CheckCircle2 size={36} color="#34d399" />
          </div>

          <span style={{
            fontSize: '0.8rem',
            fontWeight: '700',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.4)',
          }}>
            Donation Successful ✓
          </span>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', marginTop: '0.85rem' }}>
            Thank You for Your Generosity!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Your Indian Rupee contribution has been successfully confirmed and sealed on-chain.
          </p>
        </div>

        {/* Verification Checklist */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Payment</div>
            <StatusBadge type="payment" status="SUCCESSFUL" size="sm" />
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Donation</div>
            <StatusBadge type="campaign" status="ACTIVE" size="sm" />
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '0.85rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Blockchain</div>
            <StatusBadge type="blockchain" status="CONFIRMED" size="sm" />
          </div>
        </div>

        {/* Breakdown Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Campaign</span>
            <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.88rem' }}>{donation.campaignTitle}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Charity</span>
            <span style={{ color: '#34d399', fontWeight: '600', fontSize: '0.88rem' }}>{donation.charityName} ✓</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Donor</span>
            <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.88rem' }}>{donation.donorName}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Amount Contributed</span>
            <strong style={{ color: '#34d399', fontSize: '1.25rem' }}>{formatInr(donation.amountInr)}</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Donation ID</span>
            <span className="font-mono" style={{ color: '#60a5fa', fontSize: '0.85rem' }}>#{donation.donationId}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Date & Time</span>
            <span style={{ color: '#ffffff', fontSize: '0.85rem' }}>{formatDateTime(donation.date)}</span>
          </div>

          <div style={{ paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              On-Chain Transaction Hash:
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(7, 11, 20, 0.8)',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: '#93c5fd', wordBreak: 'break-all' }}>
                {donation.transactionHash}
              </span>
              <button
                onClick={copyTxHash}
                style={{ background: 'transparent', border: 'none', color: copied ? '#34d399' : '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                title="Copy Transaction Hash"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            {donation.isMetaMaskRecorded && (
              <div style={{
                marginTop: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#34d399',
                fontSize: '0.75rem',
                fontWeight: '700',
              }}>
                <CheckCircle2 size={14} color="#34d399" />
                <span>Confirmed on Blockchain & Logged in MetaMask Activity (Tamper-Free)</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <Link
            to={`/donations/${donation.donationId || donation.orderId || '1'}`}
            state={{ donation }}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              padding: '0.75rem',
              fontSize: '0.92rem',
            }}
          >
            <Receipt size={16} />
            <span>View Receipt</span>
          </Link>

          <Link
            to="/transparency/blockchain"
            className="btn btn-secondary"
            style={{ padding: '0.75rem', fontSize: '0.92rem' }}
          >
            <Eye size={16} />
            <span>View Transparency</span>
          </Link>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            to="/campaigns"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>Explore More Campaigns</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
