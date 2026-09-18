import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'rgba(244, 63, 94, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.5rem',
        color: '#fb7185',
      }}>
        <ShieldAlert size={36} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        The route you requested does not exist on the LedgerCare platform.
      </p>

      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <Home size={16} /> Return to Home
      </Link>
    </div>
  );
}
