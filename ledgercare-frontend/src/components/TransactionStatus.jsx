import React from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { shortenAddress, getExplorerTxLink } from '../utils/formatters';

/**
 * Reusable transaction status modal / inline banner.
 * Supports: Idle, Connecting Wallet, Waiting for Signature, Transaction Submitted, Confirming, Confirmed, Failed, Rejected
 */
export default function TransactionStatus({
  status, // 'idle' | 'connecting' | 'awaiting_signature' | 'submitted' | 'confirming' | 'confirmed' | 'failed' | 'rejected'
  txHash,
  errorMessage,
  onClose,
  title = 'Blockchain Transaction',
  successMessage = 'Transaction successfully recorded and confirmed on the blockchain.',
}) {
  if (!status || status === 'idle') return null;

  const renderContent = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: <Loader2 size={44} className="animate-spin" color="#3b82f6" />,
          title: 'Connecting Wallet...',
          desc: 'Please approve the wallet connection request in MetaMask.',
          badge: 'Connecting Wallet',
          badgeClass: 'badge-pending',
        };
      case 'awaiting_signature':
        return {
          icon: <Loader2 size={44} className="animate-spin" color="#8b5cf6" />,
          title: 'Waiting for Signature...',
          desc: 'Please sign and confirm the transaction in your MetaMask wallet popup.',
          badge: 'Awaiting Signature',
          badgeClass: 'badge-pending',
        };
      case 'submitted':
        return {
          icon: <Loader2 size={44} className="animate-spin" color="#60a5fa" />,
          title: 'Transaction Submitted',
          desc: 'Transaction has been broadcast to the network. Awaiting miner inclusion...',
          badge: 'Transaction Submitted',
          badgeClass: 'badge-pending',
        };
      case 'confirming':
        return {
          icon: <Loader2 size={44} className="animate-spin" color="#06b6d4" />,
          title: 'Confirming On-Chain...',
          desc: 'Waiting for block confirmation from Ethereum nodes...',
          badge: 'Confirming',
          badgeClass: 'badge-pending',
        };
      case 'confirmed':
        return {
          icon: <CheckCircle2 size={46} color="#10b981" />,
          title: 'Transaction Confirmed!',
          desc: successMessage,
          badge: 'Confirmed',
          badgeClass: 'badge-verified',
        };
      case 'rejected':
        return {
          icon: <ShieldAlert size={46} color="#f59e0b" />,
          title: 'Transaction Cancelled',
          desc: errorMessage || 'You rejected the transaction in your wallet.',
          badge: 'Rejected by User',
          badgeClass: 'badge-pending',
        };
      case 'failed':
      default:
        return {
          icon: <XCircle size={46} color="#f43f5e" />,
          title: 'Transaction Failed',
          desc: errorMessage || 'An error occurred while executing the smart contract.',
          badge: 'Failed',
          badgeClass: 'badge-cancelled',
        };
    }
  };

  const { icon, title: stateTitle, desc, badge, badgeClass } = renderContent();
  const isFinished = status === 'confirmed' || status === 'failed' || status === 'rejected';

  return (
    <div className="modal-backdrop" onClick={isFinished ? onClose : undefined}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ textAlign: 'center', padding: '2rem 1.75rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <span className={`badge ${badgeClass}`}>{badge}</span>
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
          {stateTitle}
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {desc}
        </p>

        {txHash && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Transaction Hash
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: '0.8rem',
                color: '#60a5fa',
                wordBreak: 'break-all',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <span>{txHash}</span>
              <a
                href={getExplorerTxLink(txHash)}
                target="_blank"
                rel="noreferrer"
                title="View on Explorer"
                style={{ color: '#93c5fd', flexShrink: 0 }}
              >
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        )}

        {isFinished && (
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
