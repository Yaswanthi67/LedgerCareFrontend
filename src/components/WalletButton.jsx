import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  Power,
  RefreshCw,
  ChevronDown,
  X,
} from 'lucide-react';

const MetaMaskFox = () => (
  <svg width="16" height="16" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
    <path d="M29.5 3.5L18.2 11.8L20.3 6.9L29.5 3.5Z" fill="#E17726"/>
    <path d="M2.5 3.5L11.7 11.8L9.6 6.9L2.5 3.5Z" fill="#E27625"/>
    <path d="M25.4 23.3L22.6 27.6L28.7 29.3L30.5 23.4L25.4 23.3Z" fill="#E27625"/>
    <path d="M1.5 23.4L3.3 29.3L9.4 27.6L6.6 23.3L1.5 23.4Z" fill="#E27625"/>
    <path d="M9.1 14.2L7.3 17L13.1 17.3L12.9 11.2L9.1 14.2Z" fill="#E27625"/>
    <path d="M22.9 14.2L19.1 11.1L18.8 17.3L24.7 17L22.9 14.2Z" fill="#E27625"/>
    <path d="M9.4 27.6L12.7 26.1L10 23.4L9.4 27.6Z" fill="#D5BFB2"/>
    <path d="M22.6 27.6L22 23.4L19.3 26.1L22.6 27.6Z" fill="#D5BFB2"/>
    <path d="M12.7 26.1L15.9 24.6L13.6 21.6L12.7 26.1Z" fill="#393939"/>
    <path d="M19.3 26.1L18.4 21.6L16.1 24.6L19.3 26.1Z" fill="#393939"/>
    <path d="M16 19.5L18.8 17.3L13.1 17.3L16 19.5Z" fill="#C0AD9E"/>
    <path d="M16 23.5L13.6 21.6L18.4 21.6L16 23.5Z" fill="#161616"/>
  </svg>
);

export default function WalletButton() {
  const {
    account,
    chainId,
    isConnecting,
    isConnected,
    isCorrectNetwork,
    errorMessage,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    setErrorMessage,
  } = useWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenAddExtension = () => {
    window.open(
      'https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
      '_blank',
      'noopener,noreferrer'
    );
  };

  // When wallet is not connected: always show Connect Wallet button
  if (!isConnected) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.95rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, rgba(226, 118, 37, 0.18) 0%, rgba(59, 130, 246, 0.18) 100%)',
            border: '1px solid rgba(226, 118, 37, 0.45)',
            color: '#f8fafc',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(226, 118, 37, 0.15)',
          }}
          title="Click to open MetaMask and connect"
        >
          <MetaMaskFox />
          <span>{isConnecting ? 'Opening MetaMask...' : 'Connect Wallet'}</span>
        </button>

        {errorMessage && (
          <div
            style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: '260px',
              padding: '0.75rem 0.85rem',
              background: '#0f172a',
              border: '1px solid #ef4444',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '0.75rem',
              zIndex: 100,
              boxShadow: '0 12px 28px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f87171', fontWeight: '700' }}>
                <AlertCircle size={14} />
                <span>MetaMask Notice</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>
            <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', lineHeight: '1.4' }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={connectWallet}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.5rem',
                  borderRadius: '6px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#60a5fa',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
              <button
                onClick={handleOpenAddExtension}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.5rem',
                  borderRadius: '6px',
                  background: 'rgba(226, 118, 37, 0.2)',
                  border: '1px solid rgba(226, 118, 37, 0.4)',
                  color: '#fb923c',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Add Extension
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // When wallet is connected: show shortened address & account manager dropdown
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '9999px',
          background: isCorrectNetwork ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)',
          border: isCorrectNetwork ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.4)',
          color: isCorrectNetwork ? '#34d399' : '#f87171',
          fontSize: '0.82rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        title={`Connected: ${account}`}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isCorrectNetwork ? '#10b981' : '#ef4444',
            display: 'inline-block',
            boxShadow: isCorrectNetwork ? '0 0 8px #10b981' : '0 0 8px #ef4444',
          }}
        />
        <span>{formatAddress(account)}</span>
        <ChevronDown size={14} color="#94a3b8" />
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '0.5rem',
            width: '280px',
            background: '#0f172a',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 12px 30px rgba(0,0,0,0.65)',
            zIndex: 60,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700' }}>
              MetaMask Connected
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: isCorrectNetwork ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isCorrectNetwork ? '#34d399' : '#f87171',
                fontWeight: '600',
              }}
            >
              {isCorrectNetwork ? 'Hardhat Node' : `Chain: ${chainId || 'Unknown'}`}
            </span>
          </div>

          {/* Full Address */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '0.6rem 0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Account Address</div>
            <div
              style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#e2e8f0',
                wordBreak: 'break-all',
              }}
            >
              {account}
            </div>
          </div>

          {/* Network Switcher Alert if on wrong network */}
          {!isCorrectNetwork && (
            <div
              style={{
                padding: '0.6rem 0.75rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#f87171', marginBottom: '0.4rem', fontWeight: '500' }}>
                You are on an unsupported network. Switch to Hardhat Localhost (31337).
              </div>
              <button
                onClick={switchNetwork}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} />
                Switch to Hardhat Network
              </button>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              onClick={copyAddress}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.45rem 0.65rem',
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '0.78rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Address Copied!' : 'Copy Wallet Address'}</span>
            </button>

            <button
              onClick={() => {
                disconnectWallet();
                setDropdownOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.45rem 0.65rem',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.78rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Power size={14} />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
