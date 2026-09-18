import React, { useState } from 'react';
import { CONTRACT_ADDRESSES, TARGET_CHAIN_ID, NETWORKS } from '../config/contracts';
import { shortenAddress, getExplorerAddressLink } from '../utils/formatters';
import { Shield, Copy, Check, ExternalLink, Activity } from 'lucide-react';

export default function Footer() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const targetNetwork = NETWORKS[TARGET_CHAIN_ID] || { chainName: `Chain ${TARGET_CHAIN_ID}` };

  return (
    <footer style={{
      background: '#060a12',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3rem 1.5rem 2rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem',
      }}>
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
              Ledger<span style={{ color: '#60a5fa' }}>Care</span>
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            LedgerCare is a decentralized charity management protocol built on Ethereum smart contracts. Providing end-to-end transparency, immutable donation receipts, and cryptographic evidence verification via IPFS.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.75rem',
            color: '#34d399',
          }}>
            <Activity size={14} className="animate-pulse" />
            <span>Target: {targetNetwork.chainName} (ID: {TARGET_CHAIN_ID})</span>
          </div>
        </div>

        {/* Deployed Contracts */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', marginBottom: '1rem' }}>
            Verified Smart Contracts
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(CONTRACT_ADDRESSES).map(([name, addr]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: '#e2e8f0' }}>{name}</div>
                  <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {shortenAddress(addr)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    onClick={() => copyToClipboard(addr, name)}
                    title="Copy Address"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: copiedKey === name ? '#34d399' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.2rem',
                    }}
                  >
                    {copiedKey === name ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <a
                    href={getExplorerAddressLink(addr)}
                    target="_blank"
                    rel="noreferrer"
                    title="View on Explorer"
                    style={{ color: 'var(--text-muted)', padding: '0.2rem' }}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol Architecture */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', marginBottom: '1rem' }}>
            Immutable Lifecycle
          </h4>
          <ul style={{ listStyle: 'none', fontSize: '0.83rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>1. Charity Credential Whitelisting & Registration</li>
            <li>2. Verified Campaign Deployment on Blockchain</li>
            <li>3. Immutable ETH Donations via DonationLedger</li>
            <li>4. Fund Withdrawal by Campaign Authority</li>
            <li>5. Cryptographic Evidence Upload to IPFS</li>
            <li>6. Keccak-256 Hash Matching & Public Audit</li>
          </ul>
        </div>
      </div>

      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        <div>
          © {new Date().getFullYear()} LedgerCare. Transparent Charity Management System on Blockchain.
        </div>
        <div>
          Source of Truth: <a href="https://github.com/Yaswanthi67/LedgerCareBlockchain" target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>LedgerCareBlockchain Repository</a>
        </div>
      </div>
    </footer>
  );
}
