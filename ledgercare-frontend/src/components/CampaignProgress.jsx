import React from 'react';
import { formatEth, calculateProgress } from '../utils/formatters';

export default function CampaignProgress({ raisedAmount, targetAmount, withdrawnAmount, showLabels = true }) {
  const progressPercent = calculateProgress(raisedAmount, targetAmount);

  return (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.45rem',
          fontSize: '0.85rem',
        }}>
          <div>
            <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '1rem' }}>
              {formatEth(raisedAmount, 3)} ETH
            </span>
            <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
              raised of {formatEth(targetAmount, 3)} ETH
            </span>
          </div>
          <div style={{ fontWeight: '700', color: '#60a5fa' }}>
            {progressPercent.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Progress Track */}
      <div style={{
        height: '8px',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '999px',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div
          style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {withdrawnAmount && BigInt(withdrawnAmount) > 0n && showLabels && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '0.35rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>Withdrawn for execution:</span>
          <span style={{ color: '#fbbf24', fontWeight: '600' }}>
            {formatEth(withdrawnAmount, 3)} ETH
          </span>
        </div>
      )}
    </div>
  );
}
