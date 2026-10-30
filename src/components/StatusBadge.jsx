import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';

/**
 * Standardized status badges matching Section 31
 * Types: 'charity', 'campaign', 'payment', 'evidence', 'blockchain'
 */
export default function StatusBadge({ type, status, size = 'md' }) {
  if (!status) return null;
  const s = String(status).toUpperCase();

  let text = status;
  let bg = 'rgba(148, 163, 184, 0.15)';
  let color = '#94a3b8';
  let border = 'rgba(148, 163, 184, 0.3)';
  let icon = <Clock size={12} />;

  // 1. Charity Badges
  if (type === 'charity') {
    if (s.includes('NOT_CONNECT') || s.includes('DISCONNECT') || s.includes('REQUIRED')) {
      text = 'Wallet Required';
      bg = 'rgba(244, 63, 94, 0.15)';
      color = '#fb7185';
      border = 'rgba(244, 63, 94, 0.35)';
      icon = <AlertCircle size={12} />;
    } else if (s.includes('UNREGIST')) {
      text = 'Unregistered';
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#fbbf24';
      border = 'rgba(245, 158, 11, 0.35)';
      icon = <AlertCircle size={12} />;
    } else if (s.includes('VERIF') && !s.includes('FAIL') && !s.includes('PEND')) {
      text = 'Verified ✓';
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#34d399';
      border = 'rgba(16, 185, 129, 0.35)';
      icon = <CheckCircle2 size={12} />;
    } else if (s.includes('PEND')) {
      text = 'Pending Verification';
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#fbbf24';
      border = 'rgba(245, 158, 11, 0.35)';
      icon = <Clock size={12} />;
    } else if (s.includes('FAIL')) {
      text = 'Verification Failed ✕';
      bg = 'rgba(244, 63, 94, 0.15)';
      color = '#fb7185';
      border = 'rgba(244, 63, 94, 0.35)';
      icon = <XCircle size={12} />;
    }
  }

  // 2. Campaign Badges
  else if (type === 'campaign') {
    if (s === 'ACTIVE' || s === '0') {
      text = 'Active';
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#34d399';
      border = 'rgba(16, 185, 129, 0.35)';
      icon = <CheckCircle2 size={12} />;
    } else if (s === 'COMPLETED' || s === '1') {
      text = 'Completed';
      bg = 'rgba(59, 130, 246, 0.15)';
      color = '#60a5fa';
      border = 'rgba(59, 130, 246, 0.35)';
      icon = <CheckCircle2 size={12} />;
    } else if (s === 'CANCELLED' || s === '2') {
      text = 'Cancelled';
      bg = 'rgba(244, 63, 94, 0.15)';
      color = '#fb7185';
      border = 'rgba(244, 63, 94, 0.35)';
      icon = <XCircle size={12} />;
    } else if (s === 'BLOCKED') {
      text = 'Blocked';
      bg = 'rgba(239, 68, 68, 0.15)';
      color = '#f87171';
      border = 'rgba(239, 68, 68, 0.35)';
      icon = <AlertCircle size={12} />;
    }
  }

  // 3. Payment Badges
  else if (type === 'payment') {
    if (s === 'PAID' || s === 'SUCCESSFUL' || s.includes('SUCCESS')) {
      text = 'Successful ✓';
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#34d399';
      border = 'rgba(16, 185, 129, 0.35)';
      icon = <CheckCircle2 size={12} />;
    } else if (s === 'PENDING') {
      text = 'Pending';
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#fbbf24';
      border = 'rgba(245, 158, 11, 0.35)';
      icon = <Clock size={12} />;
    } else if (s === 'FAILED') {
      text = 'Failed';
      bg = 'rgba(244, 63, 94, 0.15)';
      color = '#fb7185';
      border = 'rgba(244, 63, 94, 0.35)';
      icon = <XCircle size={12} />;
    } else if (s === 'REFUNDED') {
      text = 'Refunded';
      bg = 'rgba(168, 85, 247, 0.15)';
      color = '#c084fc';
      border = 'rgba(168, 85, 247, 0.35)';
      icon = <AlertCircle size={12} />;
    }
  }

  // 4. Evidence Badges
  else if (type === 'evidence') {
    if (s === 'VERIFIED' || s.includes('MATCH') || s === 'TRUE') {
      text = 'Verified ✓';
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#34d399';
      border = 'rgba(16, 185, 129, 0.35)';
      icon = <ShieldCheck size={12} />;
    } else if (s.includes('FAIL') || s.includes('MISMATCH') || s === 'FALSE') {
      text = 'Verification Failed ✕';
      bg = 'rgba(244, 63, 94, 0.15)';
      color = '#fb7185';
      border = 'rgba(244, 63, 94, 0.35)';
      icon = <XCircle size={12} />;
    } else if (s === 'RECORDED') {
      text = 'Recorded';
      bg = 'rgba(59, 130, 246, 0.15)';
      color = '#60a5fa';
      border = 'rgba(59, 130, 246, 0.35)';
      icon = <CheckCircle2 size={12} />;
    } else if (s === 'UPLOADED') {
      text = 'Uploaded';
      bg = 'rgba(6, 182, 212, 0.15)';
      color = '#22d3ee';
      border = 'rgba(6, 182, 212, 0.35)';
      icon = <Clock size={12} />;
    }
  }

  // 5. Blockchain Badges
  else if (type === 'blockchain') {
    if (s === 'CONFIRMED' || s === 'RECORDED_VERIFIED') {
      text = 'Confirmed ✓';
      bg = 'rgba(16, 185, 129, 0.15)';
      color = '#34d399';
      border = 'rgba(16, 185, 129, 0.35)';
      icon = <CheckCircle2 size={12} />;
    } else if (s === 'RECORDED') {
      text = 'Recorded';
      bg = 'rgba(59, 130, 246, 0.15)';
      color = '#60a5fa';
      border = 'rgba(59, 130, 246, 0.35)';
      icon = <CheckCircle2 size={12} />;
    } else if (s === 'PENDING' || s === 'SUBMITTED') {
      text = 'Pending';
      bg = 'rgba(245, 158, 11, 0.15)';
      color = '#fbbf24';
      border = 'rgba(245, 158, 11, 0.35)';
      icon = <Clock size={12} />;
    } else if (s === 'FAILED') {
      text = 'Failed';
      bg = 'rgba(244, 63, 94, 0.15)';
      color = '#fb7185';
      border = 'rgba(244, 63, 94, 0.35)';
      icon = <XCircle size={12} />;
    }
  }

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: isSmall ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.72rem' : '0.8rem',
        fontWeight: '600',
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{text}</span>
    </span>
  );
}
