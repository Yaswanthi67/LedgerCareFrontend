import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import WalletButton from './WalletButton';
import {
  Shield,
  Menu,
  X,
  HeartHandshake,
  Building2,
  Lock,
  ChevronDown,
  User,
  Heart,
  FileCheck2,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';

export default function Navbar() {
  const { role, switchRole, isDonor, isCharity, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: '1. Donor', path: '/donor' },
    { name: '2. Charity', path: '/charity' },
    { name: '3. Blockchain & Smart Contract', path: '/transparency/blockchain' },
    { name: '4. Transparency & Tracking', path: '/verify' },
  ];

  const roleConfig = {
    donor: { label: 'Donor Mode', color: '#60a5fa', icon: <Heart size={13} /> },
    charity: { label: 'Charity Portal', color: '#34d399', icon: <Building2 size={13} /> },
    admin: { label: 'Admin Monitor', color: '#a855f7', icon: <Lock size={13} /> },
  };

  const currentRoleConfig = roleConfig[role] || roleConfig.donor;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(7, 11, 20, 0.88)',
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
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.35)',
          }}>
            <Shield size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}>
                Ledger<span style={{ color: '#10b981' }}>Care</span>
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '700',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                VERIFIED
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Transparent Charity Management
            </div>
          </div>
        </Link>

        {/* Main Navigation Links: The Four Core Modules */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.88rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-sm)',
                color: isActive(link.path) ? '#34d399' : 'var(--text-secondary)',
                background: isActive(link.path) ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                border: isActive(link.path) ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions: Role Switcher & Donate Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Role Switcher Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '9999px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-subtle)',
                color: currentRoleConfig.color,
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              title="Switch user perspective for evaluation"
            >
              {currentRoleConfig.icon}
              <span>{currentRoleConfig.label}</span>
              <ChevronDown size={14} color="#94a3b8" />
            </button>

            {roleDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '210px',
                  background: '#0f172a',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  padding: '0.5rem',
                  zIndex: 60,
                }}
              >
                <div style={{
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                }}>
                  Switch Perspective
                </div>

                <button
                  onClick={() => { switchRole('donor'); setRoleDropdownOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    background: isDonor ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    color: isDonor ? '#60a5fa' : '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Heart size={14} color="#60a5fa" />
                  <span>Donor Hub</span>
                </button>

                <button
                  onClick={() => { switchRole('charity'); setRoleDropdownOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    background: isCharity ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    color: isCharity ? '#34d399' : '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Building2 size={14} color="#34d399" />
                  <span>Charity Portal</span>
                </button>

                <button
                  onClick={() => { switchRole('admin'); setRoleDropdownOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.65rem',
                    background: isAdmin ? 'rgba(168, 85, 247, 0.12)' : 'transparent',
                    color: isAdmin ? '#c084fc' : '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <Lock size={14} color="#c084fc" />
                  <span>Admin Auditor</span>
                </button>

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.4rem 0' }} />

                <Link
                  to="/charity/register"
                  onClick={() => setRoleDropdownOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.78rem',
                    color: '#94a3b8',
                  }}
                >
                  + Register New Charity
                </Link>
              </div>
            )}
          </div>

          {/* 3. Quick Action Button */}
          <Link
            to="/campaigns"
            className="btn btn-primary btn-sm"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Heart size={14} fill="#ffffff" />
            <span>Donate Now</span>
          </Link>

          {/* Mobile Hamburger */}
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '1rem 1.5rem',
          background: '#0a0e1a',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.6rem 0.75rem',
                fontSize: '0.9rem',
                color: isActive(link.path) ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {link.name}
            </Link>
          ))}

          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.5rem 0' }} />

          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.6rem 0.75rem', fontSize: '0.9rem', color: '#60a5fa' }}
          >
            Donor Dashboard
          </Link>
          <Link
            to="/charity/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.6rem 0.75rem', fontSize: '0.9rem', color: '#34d399' }}
          >
            Charity Portal
          </Link>
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.6rem 0.75rem', fontSize: '0.9rem', color: '#c084fc' }}
          >
            Admin Monitoring
          </Link>
          <Link
            to="/charity/register"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.6rem 0.75rem', fontSize: '0.9rem', color: '#fbbf24' }}
          >
            Register Charity
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </header>
  );
}
