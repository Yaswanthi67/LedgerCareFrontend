import React from 'react';
import { Link } from 'react-router-dom';
import CampaignProgress from './CampaignProgress';
import StatusBadge from './StatusBadge';
import { getDaysRemaining } from '../utils/formatters';
import { ShieldCheck, Users, Calendar, ArrowRight, Heart } from 'lucide-react';

export default function CampaignCard({ campaign, onDonateClick }) {
  if (!campaign) return null;

  const campaignId = campaign.campaignId || campaign.id;
  const title = campaign.title || campaign.campaignTitle || 'Social Welfare Campaign';
  const daysLeft = getDaysRemaining(campaign.endDate);
  const statusStr =
    campaign.status === 0 ||
    campaign.status === 'Active' ||
    campaign.campaignStatus === 0 ||
    campaign.campaignStatus === 'Active'
      ? 'Active'
      : 'Completed';

  // Default images based on category / id
  const fallbackImages = [
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  ];
  const imageUrl =
    campaign.imageUrl ||
    campaign.image ||
    fallbackImages[(Number(campaignId) || 1) % fallbackImages.length];

  const category = campaign.category || 'Education & Welfare';

  return (
    <div
      className="card card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Campaign Image with Badges */}
      <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
          }}
          onError={(e) => {
            e.target.src = fallbackImages[0];
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(7,11,20,0.85) 100%)',
        }} />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '0.85rem',
          left: '0.85rem',
          right: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#93c5fd',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}>
            {category}
          </span>
          <StatusBadge type="campaign" status={statusStr} size="sm" />
        </div>

        {/* Verified Charity Tag */}
        <div style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(6, 78, 59, 0.8)',
          backdropFilter: 'blur(6px)',
          padding: '0.2rem 0.55rem',
          borderRadius: '9999px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}>
          <ShieldCheck size={13} color="#34d399" />
          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#6ee7b7' }}>
            {campaign.charityName || 'Verified Charity'} ✓
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        gap: '1rem',
      }}>
        <div>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: '#ffffff',
            lineHeight: 1.4,
            marginBottom: '0.4rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {campaign.description}
          </p>
        </div>

        {/* Progress Bar in ₹ */}
        <div style={{ marginTop: 'auto' }}>
          <CampaignProgress
            raisedAmount={campaign.raisedAmountEth || campaign.raisedAmount}
            targetAmount={campaign.targetAmountEth || campaign.targetAmount}
            isEth={Boolean(campaign.targetAmountEth)}
          />
        </div>

        {/* Meta Stats Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={14} color="#94a3b8" />
            <span>{campaign.donorCount || 4} Donors</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} color="#94a3b8" />
            <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Completed'}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.65rem',
          paddingTop: '0.25rem',
        }}>
          <Link
            to={`/campaigns/${campaignId}`}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            <span>View Details</span>
            <ArrowRight size={13} />
          </Link>

          <button
            type="button"
            onClick={() => onDonateClick && onDonateClick(campaign)}
            className="btn btn-primary btn-sm"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Heart size={13} fill="#ffffff" />
            <span>Donate Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
