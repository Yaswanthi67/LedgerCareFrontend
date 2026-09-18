import React from 'react';
import { formatDate, shortenAddress, formatEth } from '../utils/formatters';
import {
  Building2,
  ShieldCheck,
  PlusCircle,
  Heart,
  ArrowDownToLine,
  FileCheck2,
  Clock,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function AuditTimeline({ campaign, donations = [], usages = [] }) {
  if (!campaign) return null;

  // Synthesize genuine chronological blockchain events from campaign, donations, and fund usages
  const events = [];

  // 1. Charity Registration (if available)
  if (campaign.charity) {
    events.push({
      type: 'CHARITY_REGISTERED',
      title: 'Charity Registered in Registry',
      timestamp: campaign.charity.registeredAt || campaign.startDate,
      icon: <Building2 size={16} color="#3b82f6" />,
      color: '#3b82f6',
      details: `Organization "${campaign.charity.organizationName}" registered with Reg No: ${campaign.charity.registrationNumber}`,
      wallet: campaign.charity.walletAddress,
    });

    if (campaign.charity.verified) {
      events.push({
        type: 'CHARITY_VERIFIED',
        title: 'Charity Verified on Blockchain',
        timestamp: campaign.charity.registeredAt ? campaign.charity.registeredAt + 1 : campaign.startDate,
        icon: <ShieldCheck size={16} color="#10b981" />,
        color: '#10b981',
        details: `Smart contract validated registration credential hash for ${campaign.charity.organizationName}`,
        wallet: campaign.charity.walletAddress,
      });
    }
  }

  // 2. Campaign Creation
  events.push({
    type: 'CAMPAIGN_CREATED',
    title: `Campaign #${campaign.campaignId} Deployed`,
    timestamp: campaign.startDate,
    icon: <PlusCircle size={16} color="#8b5cf6" />,
    color: '#8b5cf6',
    details: `Target: ${formatEth(campaign.targetAmount)} ETH. Title: "${campaign.title}"`,
    wallet: campaign.charityWallet,
  });

  // 3. Donations Received
  donations.forEach((d) => {
    events.push({
      type: 'DONATION_RECORDED',
      title: `Donation Received (${formatEth(d.amount)} ETH)`,
      timestamp: d.timestamp,
      icon: <Heart size={16} color="#ec4899" fill="#ec4899" />,
      color: '#ec4899',
      details: `Donation #${d.donationId} recorded in DonationLedger contract`,
      wallet: d.donor,
      amount: d.amount,
    });
  });

  // 4. Fund Usage & Evidence Uploads
  usages.forEach((u) => {
    events.push({
      type: 'FUND_USAGE_RECORDED',
      title: `Fund Usage & Evidence Stored (${formatEth(u.amount)} ETH)`,
      timestamp: u.timestamp,
      icon: <FileCheck2 size={16} color="#06b6d4" />,
      color: '#06b6d4',
      details: `Purpose: "${u.purpose}" | Evidence Hash: ${u.evidenceHash.substring(0, 18)}...`,
      wallet: u.charityWallet,
      evidenceHash: u.evidenceHash,
      amount: u.amount,
    });
  });

  // 5. Campaign Status if Completed or Cancelled
  if (campaign.status === 1) {
    events.push({
      type: 'CAMPAIGN_COMPLETED',
      title: 'Campaign Marked Completed',
      timestamp: campaign.endDate,
      icon: <CheckCircle2 size={16} color="#10b981" />,
      color: '#10b981',
      details: 'Charity finalized campaign goal on blockchain.',
      wallet: campaign.charityWallet,
    });
  }

  // Sort events chronologically (oldest to newest)
  events.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  return (
    <div style={{ position: 'relative', paddingLeft: '1.75rem' }}>
      {/* Continuous Vertical Line */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          bottom: '12px',
          left: '11px',
          width: '2px',
          background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6, #10b981)',
          opacity: 0.4,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {events.map((ev, index) => (
          <div key={index} style={{ position: 'relative' }}>
            {/* Event Node Circle */}
            <div
              style={{
                position: 'absolute',
                left: '-1.75rem',
                top: '0',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#0f172a',
                border: `2px solid ${ev.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 10px ${ev.color}40`,
                zIndex: 2,
              }}
            >
              {ev.icon}
            </div>

            {/* Event Content Box */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#ffffff' }}>
                  {ev.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} />
                  <span>{formatDate(ev.timestamp)}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                {ev.details}
              </p>

              {ev.wallet && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Actor / Wallet:</span>
                  <span className="font-mono" style={{ color: '#93c5fd' }}>{shortenAddress(ev.wallet)}</span>
                </div>
              )}

              {ev.evidenceHash && (
                <div style={{ marginTop: '0.5rem', background: 'rgba(7, 11, 20, 0.6)', padding: '0.4rem 0.65rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Immutable Hash:</div>
                  <div className="font-mono" style={{ fontSize: '0.72rem', color: '#34d399', wordBreak: 'break-all' }}>
                    {ev.evidenceHash}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
