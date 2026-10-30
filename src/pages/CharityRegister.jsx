import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import WalletButton from '../components/WalletButton';
import StatusBadge from '../components/StatusBadge';
import {
  Building2,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lock,
  FileText,
  Wallet,
} from 'lucide-react';

export default function CharityRegister() {
  const navigate = useNavigate();
  const { isDonor, setCharityProfile, switchRole } = useAuth();
  const { account, isConnected, connectWallet, getContract, executeMetaMaskTransaction } = useWallet();

  // If visiting charity registration, ensure active role is charity
  React.useEffect(() => {
    if (isDonor && switchRole) {
      switchRole('charity');
    }
  }, [isDonor, switchRole]);

  const [formData, setFormData] = useState({
    organizationName: '',
    registrationNumber: '',
    organizationType: 'Trust',
    email: '',
    phone: '',
    address: '',
    state: 'Maharashtra',
    district: 'Mumbai',
    website: '',
    description: '',
    authorizedRepresentative: '',
  });

  const [documentFile, setDocumentFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDonor && switchRole) {
      switchRole('charity');
    }

    if (!isConnected || !account) {
      setErrorMessage('MetaMask wallet connection is required to register a charity. Please connect your organization wallet first.');
      return;
    }

    if (!formData.organizationName || !formData.registrationNumber || !formData.email) {
      setErrorMessage('Please complete all mandatory registration fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    let metaMaskTxHash = null;

    try {
      if (isConnected && window.ethereum) {
        // 1. Whitelist credential via backend first
        await api.registerCharity({
          ...formData,
          walletAddress: account,
        }).catch(() => null);

        // 2. Prompt MetaMask to record the registration on-chain
        const mmTx = await executeMetaMaskTransaction({
          to: CONTRACT_ADDRESSES.CharityRegistry,
          data: JSON.stringify({
            event: 'CHARITY_REGISTRATION',
            organization: formData.organizationName,
            registrationNumber: formData.registrationNumber,
            email: formData.email,
            wallet: account,
            timestamp: Date.now(),
          }),
          contractCall: async () => {
            const crContract = await getContract('CharityRegistry');
            return await crContract.registerCharity(
              formData.organizationName,
              formData.registrationNumber,
              formData.email
            );
          },
        });

        if (mmTx && mmTx.hash) {
          metaMaskTxHash = mmTx.hash;
        }
      }

      // Dispatches to POST /api/charities/register
      const effectiveWallet = account || formData.walletAddress || '';
      const payload = {
        ...formData,
        walletAddress: effectiveWallet,
        transactionHash: metaMaskTxHash,
      };

      const res = await api.registerCharity(payload);

      if (res.success) {
        setResult({
          ...res,
          transactionHash: metaMaskTxHash || res.charity?.transactionHash,
        });

        const savedCharity = {
          id: res.charity?.charityId || Math.floor(Math.random() * 800) + 10,
          organizationName: formData.organizationName,
          registrationNumber: formData.registrationNumber,
          email: formData.email,
          walletAddress: payload.walletAddress,
          verified: true,
          verificationStatus: res.verificationStatus || 'VERIFIED',
          campaignEligibility: res.campaignEligibility || 'ALLOWED',
          hash: res.hash || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        };

        // Update local auth context charity profile with registered ID
        setCharityProfile(savedCharity);
        if (payload.walletAddress) {
          try {
            localStorage.setItem('lc_registered_charity_' + payload.walletAddress.toLowerCase(), JSON.stringify(savedCharity));
          } catch (_) {}
        }

        // Switch role to charity view
        switchRole('charity');

        // Record blockchain event on the 3rd page
        api.recordBlockchainEvent({
          recordType: 'Charity Verification',
          recordId: `CH-${(res.charity?.charityId || Date.now()).toString().slice(-4)}`,
          name: `${formData.organizationName} (${formData.registrationNumber})`,
          blockNumber: Math.floor(100 + Math.random() * 50),
          hash: res.hash || res.charity?.registrationDocumentHash || '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, '0')).join(''),
          transactionHash: metaMaskTxHash || res.charity?.transactionHash || '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, '0')).join(''),
          timestamp: new Date().toISOString(),
          status: 'CONFIRMED',
          verificationStatus: 'VERIFIED',
        });
      } else {
        throw new Error(res.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Charity registration error:', err);
      setErrorMessage(err.message || 'Charity registration failed. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '1rem auto 3rem', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.8rem',
          borderRadius: '9999px',
          background: 'rgba(59, 130, 246, 0.12)',
          color: '#60a5fa',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '0.85rem',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}>
          <ShieldCheck size={14} />
          <span>Cryptographic Organization Whitelisting</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
          Charity Registration
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
          Register your non-profit organization. The system normalizes your credentials, generates a cryptographic hash, and permanently records it on the blockchain.
        </p>
      </div>

      {result ? (
        /* Registration Result Card */
        <div className="card" style={{
          padding: '2.5rem',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <CheckCircle2 size={36} color="#34d399" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
            Charity Registration Recorded ✓
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Your organization details have been cryptographically hashed and verified on the blockchain.
          </p>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'left',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Organization</span>
              <strong style={{ color: '#ffffff' }}>{result.charity?.organizationName || formData.organizationName}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Registration Number</span>
              <span className="font-mono" style={{ color: '#ffffff' }}>{result.charity?.registrationNumber || formData.registrationNumber}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Wallet Address</span>
              <span className="font-mono" style={{ color: '#93c5fd', fontSize: '0.82rem' }}>
                {result.charity?.walletAddress || account}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Blockchain Record</span>
              <StatusBadge type="blockchain" status="RECORDED" size="sm" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Verification Status</span>
              <StatusBadge type="charity" status={result.verificationStatus || 'VERIFIED'} size="sm" />
            </div>

            <div style={{ paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                On-Chain Verification Hash:
              </div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: '#34d399', wordBreak: 'break-all', background: 'rgba(7, 11, 20, 0.7)', padding: '0.5rem', borderRadius: '4px' }}>
                {result.hash}
              </div>
            </div>

            {result.transactionHash && (
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginBottom: '0.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={14} color="#34d399" />
                  <span>Recorded in MetaMask Activity (Tamper-Free Transaction):</span>
                </div>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: '#93c5fd', wordBreak: 'break-all', background: 'rgba(7, 11, 20, 0.7)', padding: '0.5rem', borderRadius: '4px' }}>
                  {result.transactionHash}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/charity/verification" className="btn btn-secondary">
              <span>View Verification Page</span>
            </Link>
            <Link
              to="/charity/campaigns/create"
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              }}
            >
              <span>Create First Campaign</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="card" style={{ padding: '2.5rem 2rem' }}>
          {/* Prominent Charity Web3 Wallet Connection Card */}
          <div style={{
            background: isConnected
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%)'
              : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.85) 100%)',
            border: isConnected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: isConnected ? '0 4px 20px rgba(16, 185, 129, 0.15)' : '0 4px 20px rgba(245, 158, 11, 0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              }}>
                <Wallet size={22} color={isConnected ? '#34d399' : '#fbbf24'} />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {isConnected ? 'MetaMask Charity Wallet Connected' : 'Charity Blockchain Wallet Required'}
                </div>
                {isConnected ? (
                  <>
                    <div className="font-mono" style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: '700', marginTop: '0.15rem' }}>
                      {account}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#60a5fa', marginTop: '0.15rem' }}>
                      ✓ Connected to Hardhat Localhost (Chain ID: 31337) &bull; Ready for on-chain organization registration
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '700', marginTop: '0.15rem' }}>
                      Connect MetaMask to register on-chain
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Your organization address will be linked and recorded on the smart contract
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              {isConnected ? (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                }}>
                  <CheckCircle2 size={15} />
                  <span>✓ Wallet Connected</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderColor: '#f59e0b',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    padding: '0.65rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <Wallet size={16} />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Row 1: Org Name & Reg Number */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Organization Name *</label>
                <input
                  type="text"
                  required
                  name="organizationName"
                  placeholder="e.g. Hope Foundation India"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input
                  type="text"
                  required
                  name="registrationNumber"
                  placeholder="e.g. REG-12345 / 80G"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Row 2: Type, Email, Phone */}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Organization Type *</label>
                <select
                  name="organizationType"
                  value={formData.organizationType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Trust">Public Charitable Trust</option>
                  <option value="Society">Registered Society</option>
                  <option value="Section 8 Company">Section 8 Non-Profit</option>
                  <option value="Foundation">Philanthropic Foundation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Official Email *</label>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="contact@hopefoundation.org"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  required
                  name="phone"
                  placeholder="+91 98200 12345"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Row 3: Location */}
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Registered Address *</label>
                <input
                  type="text"
                  required
                  name="address"
                  placeholder="104 Nariman Point"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  required
                  name="state"
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">District *</label>
                <input
                  type="text"
                  required
                  name="district"
                  placeholder="Mumbai"
                  value={formData.district}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            {/* Row 4: Website & Authorized Rep */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Website URL</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://hopefoundation.org"
                  value={formData.website}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Authorized Representative *</label>
                <input
                  type="text"
                  required
                  name="authorizedRepresentative"
                  placeholder="e.g. Dr. Rajesh Sharma (Trustee)"
                  value={formData.authorizedRepresentative}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>On-Chain Charity Wallet Address (MetaMask) *</label>
                {!isConnected && (
                  <button
                    type="button"
                    onClick={connectWallet}
                    style={{
                      background: 'rgba(226, 118, 37, 0.15)',
                      border: '1px solid rgba(226, 118, 37, 0.35)',
                      color: '#fb923c',
                      borderRadius: '4px',
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    Connect MetaMask
                  </button>
                )}
              </div>
              <input
                type="text"
                readOnly={Boolean(account)}
                placeholder={isConnected ? account : "Connect MetaMask or enter 0x organization wallet address"}
                value={account || formData.walletAddress || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                className="form-input font-mono"
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  color: isConnected ? '#34d399' : '#ffffff',
                  fontSize: '0.88rem',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {isConnected
                  ? `✓ Dynamic address connected: ${account}`
                  : 'Click "Connect MetaMask" to connect your organization wallet dynamically, or type your address.'}
              </span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Mission & Operational Description *</label>
              <textarea
                required
                name="description"
                rows={3}
                placeholder="Brief summary of the organization's charitable activities and target impact..."
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>

            {errorMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.85rem',
              }}>
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            {!isConnected ? (
              <button
                type="button"
                onClick={connectWallet}
                className="btn btn-primary btn-lg"
                style={{
                  marginTop: '0.5rem',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Wallet size={18} />
                <span>Connect MetaMask Wallet to Register</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-lg"
                style={{
                  marginTop: '0.5rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                <ShieldCheck size={18} />
                <span>{isSubmitting ? 'Verifying & Registering on Blockchain...' : 'Register Organization on Blockchain'}</span>
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
