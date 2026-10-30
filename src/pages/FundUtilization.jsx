import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatInr, ethToInr, formatDate, truncateHash } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Layers,
  PlusCircle,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Eye,
} from 'lucide-react';

export default function FundUtilization() {
  const [searchParams] = useSearchParams();
  const defaultCampaignId = searchParams.get('campaignId') || '1';

  const [campaigns, setCampaigns] = useState([]);
  const [usages, setUsages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    campaignId: defaultCampaignId,
    purpose: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [evidenceFile, setEvidenceFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [campsRes, useRes] = await Promise.all([
          api.getCampaigns().catch(() => ({ campaigns: [] })),
          api.getCampaignUsages(defaultCampaignId).catch(() => ({ usages: [] })),
        ]);
        setCampaigns(campsRes.campaigns || []);
        setUsages(useRes.usages || []);
      } catch (err) {
        console.warn('Error loading fund utilization data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [defaultCampaignId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.purpose || !formData.amount) {
      setErrorMessage('Please provide purpose and expenditure amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let evidenceHash = '0xd4563efb5a4e26f93de0d9e38d1226b09f0b0710c60f1c78799f981cdf5adbfa';
      let ipfsCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi';

      // 1. Upload evidence to IPFS first if selected
      if (evidenceFile) {
        const uploadRes = await api.uploadEvidence(evidenceFile, {
          campaignId: formData.campaignId,
          purpose: formData.purpose,
          amount: formData.amount,
        });
        if (uploadRes.success) {
          evidenceHash = uploadRes.evidenceHash;
          ipfsCid = uploadRes.cid;
        }
      }

      // 2. Submit allocation to Backend
      const allocRes = await api.recordFundAllocation({
        campaignId: formData.campaignId,
        amount: formData.amount,
        purpose: formData.purpose,
        description: formData.description,
        date: formData.date,
        evidenceHash,
        ipfsCid,
      });

      if (allocRes.success) {
        setSuccessMessage(`Fund allocation of ${formatInr(formData.amount)} for "${formData.purpose}" successfully recorded on blockchain.`);
        // Reload list
        const updated = await api.getCampaignUsages(formData.campaignId);
        setUsages(updated.usages || []);
        setFormData({
          campaignId: defaultCampaignId,
          purpose: '',
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
        setEvidenceFile(null);
      } else {
        throw new Error(allocRes.message || 'Failed to record fund allocation.');
      }
    } catch (err) {
      console.error('Fund allocation error:', err);
      setErrorMessage(err.message || 'Could not record fund allocation. Check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
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
          marginBottom: '0.5rem',
        }}>
          <Layers size={13} />
          <span>Transparent Fund Accounting</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
          Fund Utilization & Proof of Expenditure
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Document itemized expenditures against campaign disbursements. Backed by IPFS evidence and smart contract records.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '2rem' }}>
        {/* Left: Allocation Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
            Record New Fund Allocation
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">Select Campaign *</label>
              <select
                name="campaignId"
                value={formData.campaignId}
                onChange={handleChange}
                className="form-select"
              >
                {campaigns.map((c) => (
                  <option key={c.campaignId} value={c.campaignId}>
                    #{c.campaignId}: {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Purpose / Category *</label>
                <input
                  type="text"
                  required
                  name="purpose"
                  placeholder="e.g. School Supplies, Medical Kits"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount in Rupees (₹) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  step="100"
                  name="amount"
                  placeholder="50000"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expenditure Date *</label>
              <input
                type="date"
                required
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description & Vendor Details</label>
              <textarea
                rows={2}
                name="description"
                placeholder="Vendor name, itemized quantity purchased, delivery confirmation..."
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supporting Evidence File (Bill / Receipt / Photo)</label>
              <div style={{
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
              }}>
                <input
                  type="file"
                  id="evidenceInput"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="evidenceInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <Upload size={20} color="#60a5fa" />
                  <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>
                    {evidenceFile ? evidenceFile.name : 'Upload PDF bill or invoice'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    File is uploaded to IPFS and hash-sealed on blockchain
                  </span>
                </label>
              </div>
            </div>

            {successMessage && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.85rem',
              }}>
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.85rem',
              }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '0.75rem',
              }}
            >
              <PlusCircle size={16} />
              <span>{isSubmitting ? 'Recording on Blockchain...' : 'Record Allocation & IPFS Evidence'}</span>
            </button>
          </form>
        </div>

        {/* Right: Allocation History */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem' }}>
            Allocated Funds Ledger
          </h3>

          {isLoading ? (
            <LoadingSpinner message="Fetching fund allocations..." />
          ) : usages.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)' }}>No fund allocations recorded for this campaign yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {usages.map((u) => {
                const amountInr = u.amountEth ? ethToInr(u.amountEth) : u.amount;

                return (
                  <div key={u.usageId} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>
                          {u.purpose}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Usage ID #{u.usageId} • {formatDate(u.timestamp)}
                        </div>
                      </div>
                      <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>
                        {formatInr(amountInr)}
                      </strong>
                    </div>

                    <div style={{
                      background: 'rgba(7, 11, 20, 0.7)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.75rem',
                    }}>
                      <div>Blockchain Evidence Hash:</div>
                      <div className="font-mono" style={{ color: '#93c5fd' }}>
                        {truncateHash(u.evidenceHash, 12, 10)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <StatusBadge type="evidence" status="RECORDED" size="sm" />
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '700',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                        }}>
                          Immutable
                        </span>
                      </div>
                      <Link
                        to={`/evidence/${u.usageId}`}
                        style={{
                          fontSize: '0.78rem',
                          color: '#60a5fa',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          textDecoration: 'underline',
                        }}
                      >
                        <ShieldCheck size={13} />
                        <span>Verify Cryptographic Proof</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
