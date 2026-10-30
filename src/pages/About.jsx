import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  HeartHandshake,
  FileCheck2,
  Lock,
  Layers,
  ArrowRight,
  Server,
  Zap,
} from 'lucide-react';

export default function About() {
  return (
    <div style={{ maxWidth: '860px', margin: '1rem auto 4rem', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.8rem',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#34d399',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '0.85rem',
        }}>
          <ShieldCheck size={14} />
          <span>Final-Year Blockchain Project Whitepaper</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.75rem' }}>
          About LedgerCare
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.65 }}>
          A blockchain-based transparent charity management system engineered to eliminate donation fraud and restore public confidence through mathematical proof.
        </p>
      </div>

      {/* The Core Challenge vs LedgerCare Solution */}
      <div className="grid-2" style={{ gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <div style={{ color: '#fb7185', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            The Traditional Problem
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
            The Charity Black Box
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            <li>• Over 30% of global charitable donations are consumed by unaccounted administrative overhead.</li>
            <li>• Donors receive vague email updates with zero cryptographic proof of how their money was spent.</li>
            <li>• Paper receipts and static PDF invoices can be easily fabricated or modified.</li>
            <li>• Centralized administrators manually approve charities, introducing bias and corruption risks.</li>
          </ul>
        </div>

        <div className="card" style={{ padding: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ color: '#34d399', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            The LedgerCare Solution
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.75rem' }}>
            Cryptographic Accountability
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            <li>✓ Every rupee donated via UPI or Card is immediately recorded on the blockchain donation ledger.</li>
            <li>✓ Charities cannot withdraw funds without logging verified on-chain disbursement allocations.</li>
            <li>✓ Expenditure receipts are pinned to IPFS and sealed with tamper-evident Keccak-256 hashes.</li>
            <li>✓ Automatic hash matching replaces manual admin verification, ensuring impartial zero-trust governance.</li>
          </ul>
        </div>
      </div>

      {/* Architecture Explanation */}
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', marginBottom: '1rem' }}>
          System Architecture: Invisible Blockchain, Frictionless Giving
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          One of the greatest barriers to Web3 charity adoption is user friction: MetaMask popups, gas calculations, private key anxiety, and fluctuating cryptocurrency prices. LedgerCare removes all Web3 complexity from the donor experience while retaining all blockchain guarantees.
        </p>

        <div style={{
          background: 'rgba(7, 11, 20, 0.85)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ padding: '0.2rem 0.6rem', background: '#3b82f6', color: '#fff', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>FRONTEND</span>
            <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>React + Vite + JavaScript (Zero web3 libraries; donors see only ₹ INR).</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ padding: '0.2rem 0.6rem', background: '#8b5cf6', color: '#fff', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>BACKEND</span>
            <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>Node.js + Express Relayer Wallet, Razorpay UPI Gateway, IPFS Pinata Bridge.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ padding: '0.2rem 0.6rem', background: '#10b981', color: '#fff', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>BLOCKCHAIN</span>
            <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>Ethereum / Solidity Smart Contracts: CharityRegistry, CampaignManager, DonationLedger, FundEvidenceTracker.</span>
          </div>
        </div>
      </div>

      {/* Deployed Contracts Map */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
          Smart Contract Source of Truth
        </h3>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Role in Architecture</th>
                <th>Deployed Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: '700', color: '#ffffff' }}>Charity Registry Ledger</td>
                <td>Stores normalized credential hashes; handles whitelisting & automated verification.</td>
                <td className="font-mono" style={{ color: '#60a5fa', fontSize: '0.75rem' }}>0x5FbDB2315678afecb367f032d93F642f64180aa3</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700', color: '#ffffff' }}>Campaign Manager Ledger</td>
                <td>Deploys campaigns with financial caps, target dates, and verified charity validation.</td>
                <td className="font-mono" style={{ color: '#60a5fa', fontSize: '0.75rem' }}>0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700', color: '#ffffff' }}>Donation Records Ledger</td>
                <td>Receives relayed donations; maintains immutable record of donor contributions.</td>
                <td className="font-mono" style={{ color: '#60a5fa', fontSize: '0.75rem' }}>0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '700', color: '#ffffff' }}>Fund Evidence Tracker Ledger</td>
                <td>Tracks itemized fund usages and seals IPFS CIDs with Keccak-256 evidence hashes.</td>
                <td className="font-mono" style={{ color: '#60a5fa', fontSize: '0.75rem' }}>0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Call to action */}
      <div style={{ textAlign: 'center' }}>
        <Link
          to="/campaigns"
          className="btn btn-primary btn-lg"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
          }}
        >
          <span>Explore Verified Campaigns</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
