import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatDate, truncateHash } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Building2,
  Lock,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function AdminCharityMonitoring() {
  const [charities, setCharities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadCharities() {
      setIsLoading(true);
      try {
        const res = await api.getCharities();
        setCharities(res.charities || []);
      } catch (err) {
        console.warn('Error loading charities for admin:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCharities();
  }, []);

  const copyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/admin"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Admin Overview</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#34d399',
          fontSize: '0.75rem',
          fontWeight: '700',
          marginBottom: '0.4rem',
        }}>
          <Building2 size={13} />
          <span>Read-Only Charity Registry Monitor</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff' }}>
          Admin Charity Monitoring
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Real-time observation of registered charities and smart contract hash statuses.
        </p>
      </div>

      {/* System Integrity Banner (Section 25: NO manual approval buttons) */}
      <div className="card" style={{
        padding: '1rem 1.25rem',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        background: 'rgba(15, 23, 42, 0.8)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <Lock size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.84rem', color: '#93c5fd' }}>
          <strong>System-Driven Verification:</strong> In compliance with the transparent charity model, this table does NOT feature manual "Approve" or "Reject" buttons. Charity eligibility is determined entirely by smart contract credential verification.
        </span>
      </div>

      {/* Charities Table (Section 25) */}
      {isLoading ? (
        <LoadingSpinner message="Querying registered charities from blockchain records..." />
      ) : charities.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No charities found in the blockchain registry.</p>
        </div>
      ) : (
        <div className="table-responsive card" style={{ padding: '0.5rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Charity Organization</th>
                <th>Registration Number</th>
                <th>Registration Date</th>
                <th>Original Hash</th>
                <th>Blockchain Status</th>
                <th>Verification Status</th>
                <th>Campaign Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {charities.map((c) => {
                const isVerified = c.verified !== false;
                const dummyHash = '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';

                return (
                  <tr key={c.charityId}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#ffffff' }}>
                        {c.organizationName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.email}
                      </div>
                    </td>

                    <td className="font-mono" style={{ fontWeight: '600' }}>
                      {c.registrationNumber}
                    </td>

                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {formatDate(c.registeredAt || 1789745309)}
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className="font-mono" style={{ fontSize: '0.75rem', color: '#34d399' }}>
                          {truncateHash(dummyHash, 8, 6)}
                        </span>
                        <button
                          onClick={() => copyHash(dummyHash, c.charityId)}
                          style={{ background: 'transparent', border: 'none', color: copiedId === c.charityId ? '#34d399' : 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
                          title="Copy Original Hash"
                        >
                          {copiedId === c.charityId ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>

                    <td>
                      <StatusBadge type="blockchain" status="RECORDED" size="sm" />
                    </td>

                    <td>
                      <StatusBadge type="charity" status={isVerified ? 'VERIFIED' : 'PENDING'} size="sm" />
                    </td>

                    <td>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: isVerified ? '#34d399' : '#f43f5e',
                      }}>
                        {isVerified ? 'Allowed ✓' : 'Blocked ✕'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
