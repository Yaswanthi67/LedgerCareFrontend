import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, truncateHash } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Search,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  FileText,
} from 'lucide-react';

export default function CharitiesList() {
  const { isDonor } = useAuth();
  const [charities, setCharities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCharities() {
      setIsLoading(true);
      try {
        const res = await api.getCharities();
        setCharities(res.charities || []);
      } catch (err) {
        console.warn('Error loading charities:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCharities();
  }, []);

  const filtered = charities.filter((c) =>
    c.organizationName.toLowerCase().includes(search.toLowerCase()) ||
    c.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
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
          <span>Decentralized Charity Registry</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
          Verified Charities Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore non-profit organizations that have satisfied cryptographic hash verification on <code>CharityRegistry.sol</code>.
        </p>
      </div>

      {/* Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', minWidth: '300px', flex: '1 1 300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search charity by name or registration number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.6rem' }}
          />
        </div>

        {!isDonor && (
          <Link
            to="/charity/register"
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            <PlusCircle size={16} />
            <span>Register New Charity</span>
          </Link>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSpinner message="Retrieving verified charities from blockchain..." />
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No charities found matching your search.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((c) => (
            <div
              key={c.charityId}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.75rem',
                gap: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                  }}>
                    <Building2 size={22} />
                  </div>
                  <StatusBadge type="charity" status="VERIFIED" size="sm" />
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.35rem' }}>
                  {c.organizationName}
                </h3>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Reg: <strong style={{ color: '#ffffff' }}>{c.registrationNumber}</strong>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
                  Dedicated to transparent humanitarian initiatives, education, and social upliftment across India.
                </p>

                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(7, 11, 20, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}>
                  <div>Blockchain Hash Record:</div>
                  <div className="font-mono" style={{ color: '#34d399' }}>
                    0x7f83b1657ff1...d9069
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
                <Link
                  to="/campaigns"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                >
                  <span>View Campaigns</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  to="/charity/verification"
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%' }}
                >
                  <ShieldCheck size={13} />
                  <span>Verify Status</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
