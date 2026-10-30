import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { truncateHash, formatDateTime } from '../utils/formatters';
import { CONTRACT_ADDRESSES } from '../config/contracts';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  Lock,
  Layers,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Heart,
  FileCheck2,
  ExternalLink,
  Coins,
} from 'lucide-react';

export default function BlockchainRecords() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadRecords() {
      setIsLoading(true);
      try {
        const res = await api.getBlockchainRecords();
        setRecords(res.records || []);
      } catch (err) {
        console.warn('Error loading blockchain records:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRecords();
  }, []);

  const copyHash = (hash, id) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRecords = records.filter((rec) => {
    const matchesType = filterType === 'ALL' || rec.recordType === filterType;
    const s = (search || '').toLowerCase();
    const matchesSearch =
      (rec.name || '').toLowerCase().includes(s) ||
      (rec.recordId || '').toLowerCase().includes(s) ||
      (rec.hash || '').toLowerCase().includes(s) ||
      (rec.transactionHash || '').toLowerCase().includes(s);
    return matchesType && matchesSearch;
  });

  const charityCount = records.filter((r) => r.recordType === 'Charity Verification').length;
  const campaignCount = records.filter((r) => r.recordType === 'Campaign Record').length;
  const donationCount = records.filter((r) => r.recordType === 'Donation Record').length;
  const evidenceCount = records.filter((r) => r.recordType === 'Evidence Record').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.25rem 0.65rem',
          borderRadius: '9999px',
          background: 'rgba(59, 130, 246, 0.12)',
          color: '#60a5fa',
          fontSize: '0.75rem',
          fontWeight: '700',
          marginBottom: '0.4rem',
        }}>
          <Lock size={13} />
          <span>Read-Only Public Ledger Explorer</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff' }}>
          Blockchain & Smart Contract Audit Records
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Immutable records anchored directly to Solidity smart contracts on the Ethereum ledger. Verified cryptographically via SHA-256 and transaction hashes.
        </p>
      </div>

      {/* Contract Verification Summary Cards */}
      <div className="grid-4" style={{ gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>CharityRegistry.sol</span>
            <Building2 size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>
            {charityCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {truncateHash(CONTRACT_ADDRESSES?.CharityRegistry || '0x5FbDB2315678afecb367f032d93F642f64180aa3', 6, 4)}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>CampaignManager.sol</span>
            <Layers size={16} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>
            {campaignCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {truncateHash(CONTRACT_ADDRESSES?.CampaignManager || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512', 6, 4)}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>DonationLedger.sol</span>
            <Heart size={16} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>
            {donationCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {truncateHash(CONTRACT_ADDRESSES?.DonationLedger || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', 6, 4)}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>FundEvidenceTracker.sol</span>
            <FileCheck2 size={16} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>
            {evidenceCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {truncateHash(CONTRACT_ADDRESSES?.FundEvidenceTracker || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', 6, 4)}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'Charity Verification', 'Campaign Record', 'Donation Record', 'Evidence Record'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  border: filterType === type ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                  background: filterType === type ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: filterType === type ? '#60a5fa' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {type === 'ALL' ? `All Records (${records.length})` : type}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by ID, name, hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Records Table */}
      {isLoading ? (
        <LoadingSpinner message="Querying on-chain records from backend relayer..." />
      ) : filteredRecords.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No records match your filter.</p>
        </div>
      ) : (
        <div className="table-responsive card" style={{ padding: '0.5rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Record Type</th>
                <th>Record ID</th>
                <th>Description / Actor</th>
                <th>Block #</th>
                <th>Hash / SHA-256</th>
                <th>Transaction Hash</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background:
                        r.recordType === 'Charity Verification'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : r.recordType === 'Evidence Record'
                          ? 'rgba(245, 158, 11, 0.15)'
                          : r.recordType === 'Donation Record'
                          ? 'rgba(244, 63, 94, 0.15)'
                          : 'rgba(59, 130, 246, 0.15)',
                      color:
                        r.recordType === 'Charity Verification'
                          ? '#34d399'
                          : r.recordType === 'Evidence Record'
                          ? '#fbbf24'
                          : r.recordType === 'Donation Record'
                          ? '#fda4af'
                          : '#93c5fd',
                    }}>
                      {r.recordType}
                    </span>
                  </td>

                  <td className="font-mono" style={{ fontWeight: '700', color: '#ffffff' }}>
                    {r.recordId}
                  </td>

                  <td style={{ fontSize: '0.85rem', color: '#e2e8f0', maxWidth: '240px' }}>
                    {r.name}
                  </td>

                  <td className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    #{r.blockNumber}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#34d399' }}>
                        {truncateHash(r.hash, 6, 6)}
                      </span>
                      <button
                        onClick={() => copyHash(r.hash, `${r.id}-h`)}
                        style={{ background: 'transparent', border: 'none', color: copiedId === `${r.id}-h` ? '#34d399' : 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
                        title="Copy Hash"
                      >
                        {copiedId === `${r.id}-h` ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#60a5fa' }}>
                        {truncateHash(r.transactionHash, 6, 6)}
                      </span>
                      <button
                        onClick={() => copyHash(r.transactionHash, `${r.id}-tx`)}
                        style={{ background: 'transparent', border: 'none', color: copiedId === `${r.id}-tx` ? '#34d399' : 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem' }}
                        title="Copy Tx Hash"
                      >
                        {copiedId === `${r.id}-tx` ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>

                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formatDateTime(r.timestamp)}
                  </td>

                  <td>
                    <StatusBadge type="blockchain" status={r.status} size="sm" />
                  </td>

                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      color: r.verificationStatus === 'TAMPERED' ? '#ef4444' : '#34d399',
                      fontWeight: '700',
                    }}>
                      {r.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
