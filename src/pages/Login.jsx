import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Heart,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  User,
  Mail,
  Phone,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, loginAs } = useAuth();

  const isDonorRoute = location.pathname.includes('/donor/login');

  const [selectedRole, setSelectedRole] = useState(isDonorRoute ? 'donor' : (role || 'donor'));
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (isDonorRoute) {
      setSelectedRole('donor');
    }
  }, [isDonorRoute]);

  const handleRoleSelect = (r) => {
    setSelectedRole(r);
    if (r === 'donor') {
      setName(user?.name || '');
      setEmail(user?.email || '');
    } else if (r === 'charity') {
      setName('LedgerCare Demo Charity');
      setEmail('demo@ledgercare.org');
    } else if (r === 'admin') {
      setName('System Auditor');
      setEmail('auditor@ledgercare.org');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = name.trim() || (selectedRole === 'donor' ? 'Donor' : 'Charity Partner');
    const finalEmail = email.trim() || `${finalName.toLowerCase().replace(/\s+/g, '')}@example.com`;

    loginAs(selectedRole, {
      name: finalName,
      email: finalEmail,
      phone: phone.trim() || '9820098200',
    });

    if (selectedRole === 'donor') {
      navigate('/donor');
    } else if (selectedRole === 'charity') {
      navigate('/charity');
    } else {
      navigate('/admin');
    }
  };

  return (
    <div style={{ maxWidth: '540px', margin: '2rem auto 4rem', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: isDonorRoute || selectedRole === 'donor'
              ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
          }}>
            {selectedRole === 'donor' ? (
              <Heart size={24} color="#ffffff" />
            ) : (
              <Shield size={24} color="#ffffff" />
            )}
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.35rem' }}>
            {isDonorRoute || selectedRole === 'donor' ? 'Donor Sign In / Profile' : 'LedgerCare Portal Login'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            {isDonorRoute || selectedRole === 'donor'
              ? 'Enter your name to personalize your donor receipts, dashboard, and impact tracking.'
              : 'Choose your portal perspective to navigate and evaluate LedgerCare.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Role Tiles: only show on generic /login, hide on dedicated /donor/login */}
          {!isDonorRoute && (
            <div>
              <label className="form-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
                Select Portal Perspective
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('donor')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '1rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedRole === 'donor'
                      ? '2px solid #3b82f6'
                      : '1px solid var(--border-subtle)',
                    background: selectedRole === 'donor'
                      ? 'rgba(59, 130, 246, 0.18)'
                      : 'rgba(15, 23, 42, 0.6)',
                    color: selectedRole === 'donor' ? '#60a5fa' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Heart size={20} />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Donor Hub</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('charity')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '1rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedRole === 'charity'
                      ? '2px solid #10b981'
                      : '1px solid var(--border-subtle)',
                    background: selectedRole === 'charity'
                      ? 'rgba(16, 185, 129, 0.18)'
                      : 'rgba(15, 23, 42, 0.6)',
                    color: selectedRole === 'charity' ? '#34d399' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Building2 size={20} />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Charity Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '1rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedRole === 'admin'
                      ? '2px solid #a855f7'
                      : '1px solid var(--border-subtle)',
                    background: selectedRole === 'admin'
                      ? 'rgba(168, 85, 247, 0.18)'
                      : 'rgba(15, 23, 42, 0.6)',
                    color: selectedRole === 'admin' ? '#c084fc' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Lock size={20} />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Admin Auditor</span>
                </button>
              </div>
            </div>
          )}

          {/* User Fields */}
          <div className="form-group">
            <label className="form-label">
              {selectedRole === 'donor' ? 'Donor Full Name *' : 'Full Name / Organization *'}
            </label>
            <input
              type="text"
              required
              placeholder={selectedRole === 'donor' ? 'e.g. Rahul Sharma or your name' : 'e.g. Hope Foundation'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          {selectedRole === 'donor' && (
            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+91 98200 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{
              background: selectedRole === 'donor'
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              marginTop: '0.5rem',
            }}
          >
            <span>{selectedRole === 'donor' ? 'Save & Enter Donor Hub' : `Enter as ${selectedRole.toUpperCase()}`}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {!isDonorRoute && (
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
          }}>
            New non-profit organization?{' '}
            <Link to="/charity/register" style={{ color: '#60a5fa', fontWeight: '600' }}>
              Register as Charity →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
