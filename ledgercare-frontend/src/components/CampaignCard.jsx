import React from 'react';
import { Link } from 'react-router-dom';
import CampaignProgress from './CampaignProgress';
import { formatDate, shortenAddress } from '../utils/formatters';
import { Building2, Calendar, Heart, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';

export default function CampaignCard({ campaign, onDonateClick }) {
  if (!campaign) return null;

  const {
    campaignId,
    title,
    description,
    charityName,
    charityWallet,
    targetAmount,
    raisedAmount,
    withdrawnAmount,
    startDate,
    endDate,
    status,
  } = campaign;

  const getStatusBadge = () => {
    switch (status) {
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

  const isFundable = status === 0;

  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          color: 'var(--text-muted)',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.2rem 0.55rem',
          borderRadius: 'var(--radius-sm)',
        }}>
          #{campaignId}
        </span>
        {getStatusBadge()}
      </div>

      {/* Title & Description */}
      <h3 style={{
        fontSize: '1.2rem',
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: '0.5rem',
        lineHeight: 1.35,
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: '0.86rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        marginBottom: '1.25rem',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1,
      }}>
        {description}
      </p>

      {/* Charity Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1.25rem',
        fontSize: '0.8rem',
      }}>
        <Building2 size={16} color="#60a5fa" />
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: '600', color: '#ffffff' }}>{charityName || 'Verified Charity'}</span>
          <span className="font-mono" style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
            ({shortenAddress(charityWallet)})
          </span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '1.25rem' }}>
        <CampaignProgress
          raisedAmount={raisedAmount}
          targetAmount={targetAmount}
          withdrawnAmount={withdrawnAmount}
        />
      </div>

      {/* Dates */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '0.75rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={13} />
          <span>Ends: {formatDate(endDate)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: isFundable ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
        <Link
          to={`/campaign/${campaignId}`}
          className="btn btn-secondary"
          style={{ width: '100%', fontSize: '0.85rem' }}
        >
          <span>View Details</span>
          <ArrowUpRight size={15} />
        </Link>

        {isFundable && (
          <button
            onClick={() => onDonateClick && onDonateClick(campaign)}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            <Heart size={15} fill="currentColor" />
            <span>Donate</span>
          </button>
        )}
      </div>
    </div>
  );
}
