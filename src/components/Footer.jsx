import React, { useState } from 'react';
import { Shield, Activity, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
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
        {/* Brand & Mission */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
              Ledger<span style={{ color: '#10b981' }}>Care</span>
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            LedgerCare is a blockchain-based transparent charity management system. Every charity is verified on smart contracts, donations are recorded immutably, and fund usage is backed by IPFS evidence.
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.75rem',
            color: '#34d399',
          }}>
            <Activity size={14} />
            <span>Smart Contract & IPFS Verification: Active</span>
          </div>
        </div>

        {/* Platform Portals */}
        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', marginBottom: '1rem' }}>
            Platform Portals
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem' }}>
            <li>
              <Link to="/donor" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>
                1. Donor Portal & Campaigns
              </Link>
            </li>
            <li>
              <Link to="/charity" style={{ color: 'var(--text-secondary)' }}>
                2. Charity Portal & Management
              </Link>
            </li>
            <li>
              <Link to="/transparency/blockchain" style={{ color: 'var(--text-secondary)' }}>
                3. Blockchain & Smart Contract
              </Link>
            </li>
            <li>
              <Link to="/verify" style={{ color: 'var(--text-secondary)' }}>
                4. Transparency & Tracking
              </Link>
            </li>
          </ul>
        </div>

        {/* Verification & Audit */}
        <div>
          <h4 style={{ fontSize: '0.88rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffffff', marginBottom: '1rem' }}>
            Security & Verification
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem' }}>
            <li>
              <Link to="/verify" style={{ color: 'var(--text-secondary)' }}>
                Direct SHA-256 Hash Verifier
              </Link>
            </li>
            <li>
              <Link to="/charities" style={{ color: 'var(--text-secondary)' }}>
                Verified Charities Directory
              </Link>
            </li>
            <li>
              <Link to="/campaigns" style={{ color: 'var(--text-secondary)' }}>
                Active Fundraising Campaigns
              </Link>
            </li>
            <li>
              <Link to="/charity/register" style={{ color: 'var(--text-secondary)' }}>
                Charity Organization Registration
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Row */}
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
          © {new Date().getFullYear()} LedgerCare. Blockchain Charity Management Platform. All rights reserved.
        </div>
        <div>
          <Link to="/transparency/blockchain" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
            Blockchain Audit Trail
          </Link>
        </div>
      </div>
    </footer>
  );
}
