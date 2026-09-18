import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { shortenAddress, formatEth } from '../utils/formatters';
import { TARGET_CHAIN_ID, NETWORKS } from '../config/contracts';
import {
  Shield,
  Wallet,
  Menu,
  X,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  LogOut,
  Building2,
  HeartHandshake,
  FileCheck2,
  Lock,
} from 'lucide-react';

export default function Navbar() {
  const {
    account,
    balance,
    chainId,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    userRole,
    isCharityVerified,
  } = useWallet();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const location = useLocation();

  const targetNetwork = NETWORKS[TARGET_CHAIN_ID] || { chainName: `Chain ${TARGET_CHAIN_ID}` };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Campaigns', path: '/campaigns' },
    { name: 'Donor Hub', path: '/donor' },
    { name: 'Charity Portal', path: '/charity' },
    { name: 'Evidence Verifier', path: '/verify' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <>
      {/* Wrong Network Warning Banner */}
      {account && !isCorrectNetwork && (
        <div style={{
          background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
          color: '#ffffff',
          padding: '0.6rem 1rem',
          fontSize: '0.85rem',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          zIndex: 100,
        }}>
          <AlertTriangle size={18} />
          <span>
            Wrong network detected (Chain ID: {chainId || 'Unknown'}). Please switch to{' '}
            <strong>{targetNetwork.chainName}</strong> (Chain ID: {TARGET_CHAIN_ID}).
          </span>
          <button
            onClick={() => switchNetwork(TARGET_CHAIN_ID)}
            style={{
              background: '#ffffff',
              color: '#991b1b',
              border: 'none',
              borderRadius: '4px',
              padding: '0.2rem 0.65rem',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Switch Network
          </button>
        </div>
      )}

      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 11, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
            }}>
              <Shield size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Ledger<span style={{ color: '#60a5fa' }}>Care</span>
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.4rem',
                  borderRadius: '4px',
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}>
                  WEB3
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Transparent Charity Management
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.88rem',
                  fontWeight: '500',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive(link.path) ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive(link.path) ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {account ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.45rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {/* Role indicator pill */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: isCharityVerified
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(59, 130, 246, 0.2)',
                    color: isCharityVerified ? '#34d399' : '#60a5fa',
                  }}>
                    {isCharityVerified ? <Building2 size={12} /> : <HeartHandshake size={12} />}
                    {isCharityVerified ? 'Charity' : 'Donor'}
                  </span>

                  <span className="font-mono">{shortenAddress(account)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {formatEth(balance, 3)} ETH
                  </span>
                  <ChevronDown size={14} color="#94a3b8" />
                </button>

                {/* Dropdown Menu */}
                {walletDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '260px',
                      background: '#0f172a',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                      padding: '0.75rem',
                      zIndex: 60,
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected Wallet</div>
                      <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff', wordBreak: 'break-all' }}>
                        {account}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '0.35rem' }}>
                        Balance: <strong>{formatEth(balance, 4)} ETH</strong>
                      </div>
                    </div>

                    <div style={{ padding: '0.5rem 0' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem' }}>
                        Network: {targetNetwork.chainName}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        disconnectWallet();
                        setWalletDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(244, 63, 94, 0.1)',
                        color: '#fb7185',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: '600',
                      }}
                    >
                      <LogOut size={14} /> Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
              >
                <Wallet size={16} />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-hamburger"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '0.4rem',
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '1rem 1.5rem 1.5rem',
              background: '#0a0e1a',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  color: isActive(link.path) ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive(link.path) ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Global CSS responsive hook for mobile nav */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </>
  );
}
