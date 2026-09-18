import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatEth, formatDate, shortenAddress } from '../utils/formatters';
import { FileCheck, Copy, Check, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

export default function EvidenceCard({ usage }) {
  const [copied, setCopied] = useState(false);

  if (!usage) return null;

  const { usageId, campaignId, charityWallet, amount, purpose, evidenceHash, timestamp } = usage;

  const handleCopy = () => {
    navigator.clipboard.writeText(evidenceHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if purpose contains an IPFS CID like Qm... or bafy...
  const ipfsMatch = purpose.match(/(Qm[1-9A-HJ-NP-za-km-z]{44}|bafy[a-zA-Z0-9]{45,})/);
  const ipfsCid = ipfsMatch ? ipfsMatch[0] : null;
  const ipfsUrl = ipfsCid ? `https://gateway.pinata.cloud/ipfs/${ipfsCid}` : null;

  return (
    <div className="card" style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
          }}>
            <FileCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proof of Expenditure</div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>
              Fund Usage #{usageId}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#34d399' }}>
            {formatEth(amount, 3)} ETH
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {formatDate(timestamp)}
          </div>
        </div>
      </div>

      {/* Purpose */}
      <div style={{
        background: 'rgba(7, 11, 20, 0.6)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1rem',
        fontSize: '0.88rem',
        color: '#e2e8f0',
        lineHeight: 1.5,
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
          Documented Purpose
        </div>
        {purpose}
      </div>

      {/* IPFS Link if present */}
      {ipfsUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: '#60a5fa',
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            <ExternalLink size={13} />
            <span>View Decentralized IPFS Asset ({ipfsCid.substring(0, 10)}...)</span>
          </a>
        </div>
      )}

      {/* On-Chain Evidence Hash */}
      <div style={{
        background: 'rgba(7, 11, 20, 0.8)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.65rem 0.85rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
            On-Chain Keccak-256 Hash
          </span>
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              border: 'none',
              color: copied ? '#34d399' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.72rem',
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <div className="font-mono" style={{ fontSize: '0.78rem', color: '#93c5fd', wordBreak: 'break-all' }}>
          {evidenceHash}
        </div>
      </div>

      {/* Verification Navigation CTA */}
      <Link
        to={`/verify?campaignId=${campaignId}&usageId=${usageId}&expectedHash=${evidenceHash}`}
        className="btn btn-outline"
        style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem' }}
      >
        <ShieldCheck size={16} />
        <span>Verify Cryptographic Match</span>
      </Link>
    </div>
  );
}
