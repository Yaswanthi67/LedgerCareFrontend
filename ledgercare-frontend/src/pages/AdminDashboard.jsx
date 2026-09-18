import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { computeCredentialHash } from '../utils/hash';
import { fetchAllCharities, fetchAllCampaigns, parseContractError } from '../services/blockchain';
import { formatDate, shortenAddress, formatEth, getExplorerAddressLink } from '../utils/formatters';
import TransactionStatus from '../components/TransactionStatus';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  RefreshCw,
  PlusCircle,
  Hash,
} from 'lucide-react';

export default function AdminDashboard() {
  const { account, isCorrectNetwork, activeProvider } = useWallet();
  const { charityRegistry } = useContract();

  const [charities, setCharities] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Credential Whitelister Form State
  const [credForm, setCredForm] = useState({
    organizationName: '',
    registrationNumber: '',
    email: '',
    walletAddress: '',
  });

  const [generatedHash, setGeneratedHash] = useState('');

  // Transaction state
  const [txState, setTxState] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');
  const [txSuccessMsg, setTxSuccessMsg] = useState('');

  const loadData = async () => {
    if (!activeProvider) return;
    setIsLoading(true);
    try {
      const [charityList, campaignList] = await Promise.all([
        fetchAllCharities(activeProvider),
        fetchAllCampaigns(activeProvider),
      ]);
      setCharities(charityList);
      setCampaigns(campaignList);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeProvider]);

  // Compute live hash when inputs change
  useEffect(() => {
    if (
      credForm.organizationName.trim() &&
      credForm.registrationNumber.trim() &&
      credForm.email.trim() &&
      credForm.walletAddress.trim().startsWith('0x') &&
      credForm.walletAddress.trim().length === 42
    ) {
      try {
        const hash = computeCredentialHash(
          credForm.organizationName,
          credForm.registrationNumber,
          credForm.email,
          credForm.walletAddress
        );
        setGeneratedHash(hash);
      } catch {
        setGeneratedHash('');
      }
    } else {
      setGeneratedHash('');
    }
  }, [credForm]);

  // Submit addValidRegistrationCredential to CharityRegistry.sol
  const handleWhitelistCredential = async (e) => {
    e.preventDefault();
    if (!charityRegistry) {
      setToast({ message: 'Please connect your wallet first.', type: 'error' });
      return;
    }

    if (!generatedHash) {
      setToast({ message: 'Please provide valid charity credential parameters.', type: 'error' });
      return;
    }

    try {
      setTxState('awaiting_signature');
      const tx = await charityRegistry.addValidRegistrationCredential(generatedHash);

      setTxHash(tx.hash);
      setTxState('confirming');

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxState('confirmed');
        setTxSuccessMsg('Charity credential hash whitelisted successfully on CharityRegistry.sol!');
        setCredForm({ organizationName: '', registrationNumber: '', email: '', walletAddress: '' });
        setGeneratedHash('');
        await loadData();
      } else {
        setTxState('failed');
        setTxError('Transaction reverted on blockchain.');
      }
    } catch (err) {
      console.error('Whitelisting error:', err);
      const parsed = parseContractError(err);
      if (err.code === 4001) {
        setTxState('rejected');
      } else {
        setTxState('failed');
      }
      setTxError(parsed);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff' }}>
              Admin & Governance Portal
            </h1>
            <span className="badge badge-verified">Protocol Authority</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Authorize charity credentials, monitor deployed campaigns, and verify system integrity.
          </p>
        </div>

        <button onClick={loadData} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Whitelist Charity Credentials Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
          }}>
            <Key size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
              Authorize Charity Credential
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Calls <code>CharityRegistry.addValidRegistrationCredential(bytes32 credentialHash)</code>
            </p>
          </div>
        </div>

        <form onSubmit={handleWhitelistCredential}>
          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Charity Organization Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Hope Water Global"
                className="form-input"
                value={credForm.organizationName}
                onChange={(e) => setCredForm({ ...credForm, organizationName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Government Registration ID</label>
              <input
                type="text"
                required
                placeholder="e.g. NGO-REG-99421"
                className="form-input"
                value={credForm.registrationNumber}
                onChange={(e) => setCredForm({ ...credForm, registrationNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Representative Email</label>
              <input
                type="email"
                required
                placeholder="director@hopewater.org"
                className="form-input"
                value={credForm.email}
                onChange={(e) => setCredForm({ ...credForm, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Charity Wallet Address (0x...)</label>
              <input
                type="text"
                required
                placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                className="form-input font-mono"
                value={credForm.walletAddress}
                onChange={(e) => setCredForm({ ...credForm, walletAddress: e.target.value })}
              />
            </div>
          </div>

          {/* Generated Credential Hash Preview */}
          {generatedHash && (
            <div style={{
              background: 'rgba(7, 11, 20, 0.7)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.25rem' }}>
                <Hash size={14} />
                <span>Deterministic Keccak-256 Credential Hash to be Stored On-Chain</span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.8rem', color: '#34d399', wordBreak: 'break-all' }}>
                {generatedHash}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem' }}
          >
            <ShieldCheck size={18} />
            <span>Submit Credential Authorization to Blockchain</span>
          </button>
        </form>
      </div>

      {/* Verified Charities List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>
            Registered Charities in CharityRegistry.sol ({charities.length})
          </h3>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Reading registered charities from blockchain..." />
        ) : charities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No registered charities found in the contract.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Organization</th>
                  <th>Registration No</th>
                  <th>Email</th>
                  <th>Wallet Address</th>
                  <th>Status</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {charities.map((c) => (
                  <tr key={c.charityId}>
                    <td style={{ fontWeight: '600' }}>#{c.charityId}</td>
                    <td style={{ fontWeight: '600', color: '#ffffff' }}>{c.organizationName}</td>
                    <td className="font-mono">{c.registrationNumber}</td>
                    <td>{c.email}</td>
                    <td className="font-mono" style={{ color: '#93c5fd' }}>
                      <a
                        href={getExplorerAddressLink(c.walletAddress)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#93c5fd' }}
                      >
                        {shortenAddress(c.walletAddress)}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      {c.verified ? (
                        <span className="badge badge-verified">Verified</span>
                      ) : (
                        <span className="badge badge-pending">Pending</span>
                      )}
                    </td>
                    <td>{formatDate(c.registeredAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Campaigns Overview */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          All Monitored Campaigns ({campaigns.length})
        </h3>

        {campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            No campaigns active yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Charity</th>
                  <th>Target</th>
                  <th>Raised</th>
                  <th>Withdrawn</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((camp) => (
                  <tr key={camp.campaignId}>
                    <td style={{ fontWeight: '600' }}>#{camp.campaignId}</td>
                    <td style={{ fontWeight: '600', color: '#ffffff' }}>{camp.title}</td>
                    <td>{camp.charityName || shortenAddress(camp.charityWallet)}</td>
                    <td>{formatEth(camp.targetAmount)} ETH</td>
                    <td style={{ color: '#34d399', fontWeight: '600' }}>
                      {formatEth(camp.raisedAmount)} ETH
                    </td>
                    <td style={{ color: '#fbbf24' }}>
                      {formatEth(camp.withdrawnAmount)} ETH
                    </td>
                    <td>
                      {camp.status === 0 && <span className="badge badge-active">Active</span>}
                      {camp.status === 1 && <span className="badge badge-completed">Completed</span>}
                      {camp.status === 2 && <span className="badge badge-cancelled">Cancelled</span>}
                    </td>
                    <td>
                      <a href={`/campaign/${camp.campaignId}`} className="btn btn-secondary btn-sm">
                        Audit Trail
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Status Modal */}
      <TransactionStatus
        status={txState}
        txHash={txHash}
        errorMessage={txError}
        onClose={() => setTxState('idle')}
        successMessage={txSuccessMsg}
      />
    </div>
  );
}
