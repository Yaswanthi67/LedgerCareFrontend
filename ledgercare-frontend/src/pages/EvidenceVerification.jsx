import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { computeFileKeccak256 } from '../utils/hash';
import { formatEth, formatDate, shortenAddress } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Hash,
} from 'lucide-react';

export default function EvidenceVerification() {
  const [searchParams] = useSearchParams();
  const { activeProvider } = useWallet();
  const { fundEvidenceTracker } = useContract();

  // Query params prefill
  const queryUsageId = searchParams.get('usageId') || '';
  const queryExpectedHash = searchParams.get('expectedHash') || '';

  const [usageIdInput, setUsageIdInput] = useState(queryUsageId);
  const [file, setFile] = useState(null);
  const [computedHash, setComputedHash] = useState('');
  const [blockchainHash, setBlockchainHash] = useState(queryExpectedHash);
  const [onChainUsage, setOnChainUsage] = useState(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null); // 'match' | 'mismatch' | null
  const [errorMsg, setErrorMsg] = useState('');

  // Handle on-chain lookup for Usage ID
  const fetchOnChainRecord = async (uId) => {
    if (!fundEvidenceTracker || !uId) return;
    setErrorMsg('');
    try {
      const idNum = parseInt(uId, 10);
      const hash = await fundEvidenceTracker.getEvidenceHash(idNum);
      const usage = await fundEvidenceTracker.getFundUsage(idNum);

      setBlockchainHash(hash);
      setOnChainUsage({
        usageId: Number(usage.usageId),
        campaignId: Number(usage.campaignId),
        charityWallet: usage.charityWallet,
        amount: usage.amount.toString(),
        purpose: usage.purpose,
        evidenceHash: usage.evidenceHash,
        timestamp: Number(usage.timestamp),
      });
    } catch (err) {
      console.warn('Error querying usage from tracker:', err);
      setErrorMsg(`Fund Usage #${uId} was not found on the blockchain.`);
      setBlockchainHash('');
      setOnChainUsage(null);
    }
  };

  useEffect(() => {
    if (queryUsageId && fundEvidenceTracker) {
      fetchOnChainRecord(queryUsageId);
    }
  }, [queryUsageId, fundEvidenceTracker]);

  // Handle file selection & compute Keccak-256
  const handleFileChange = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsVerifying(true);
    setErrorMsg('');
    setVerificationResult(null);

    try {
      const calculated = await computeFileKeccak256(selectedFile);
      setComputedHash(calculated);

      // If blockchain hash is already present, compare immediately
      if (blockchainHash) {
        if (calculated.toLowerCase() === blockchainHash.toLowerCase()) {
          setVerificationResult('match');
        } else {
          setVerificationResult('mismatch');
        }
      }
    } catch (err) {
      console.error('Hash calculation error:', err);
      setErrorMsg('Failed to read and hash the selected file.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = () => {
    if (!computedHash) {
      setErrorMsg('Please upload an evidence file first.');
      return;
    }
    if (!blockchainHash) {
      setErrorMsg('Please specify a valid Fund Usage ID or on-chain hash.');
      return;
    }

    if (computedHash.toLowerCase() === blockchainHash.toLowerCase()) {
      setVerificationResult('match');
    } else {
      setVerificationResult('mismatch');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.9rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '1rem',
        }}>
          <ShieldCheck size={16} />
          <span>Keccak-256 Cryptographic Verification</span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
          Evidence Verification Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', maxWidth: '680px', margin: '0 auto' }}>
          Audit any charity expenditure proof. The system generates the file’s cryptographic hash locally and verifies it directly against the immutable record on Ethereum.
        </p>
      </div>

      {/* Step 1: Query On-Chain Record */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="#60a5fa" />
          <span>Step 1: Locate On-Chain Fund Usage Record</span>
        </h3>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{ flex: '1', minWidth: '220px' }}>
            <input
              type="number"
              min="1"
              placeholder="Enter Fund Usage ID (e.g. 1)"
              value={usageIdInput}
              onChange={(e) => setUsageIdInput(e.target.value)}
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>
          <button
            onClick={() => fetchOnChainRecord(usageIdInput)}
            className="btn btn-secondary"
          >
            Query Smart Contract
          </button>
        </div>

        {onChainUsage && (
          <div style={{
            background: 'rgba(7, 11, 20, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem 1.25rem',
            fontSize: '0.85rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Usage Record</span>
              <strong style={{ color: '#ffffff' }}>#{onChainUsage.usageId} for Campaign #{onChainUsage.campaignId}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Expenditure Amount</span>
              <strong style={{ color: '#34d399' }}>{formatEth(onChainUsage.amount)} ETH</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Documented Purpose</span>
              <span style={{ color: '#e2e8f0', textAlign: 'right', maxWidth: '65%' }}>{onChainUsage.purpose}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Charity Wallet</span>
              <span className="font-mono" style={{ color: '#93c5fd' }}>{shortenAddress(onChainUsage.charityWallet)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>On-Chain Hash (Target)</span>
              <div className="font-mono" style={{ color: '#60a5fa', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                {onChainUsage.evidenceHash}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Upload Evidence File to Verify */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileCheck size={18} color="#8b5cf6" />
          <span>Step 2: Upload or Drop Evidence File</span>
        </h3>

        <div style={{
          border: '2px dashed var(--border-focus)',
          borderRadius: 'var(--radius-md)',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.4)',
          cursor: 'pointer',
        }}>
          <input
            type="file"
            id="verifierFileInput"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
          <label htmlFor="verifierFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a855f7',
            }}>
              <Upload size={28} />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' }}>
                {file ? file.name : 'Choose Evidence Document to Verify'}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                PDF, JPG, PNG invoices, receipts, or audit reports.
              </p>
            </div>

            {file && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
              }}>
                <CheckCircle2 size={14} />
                <span>File loaded ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </label>
        </div>

        {/* Computed Hash Display */}
        {computedHash && (
          <div style={{
            background: 'rgba(7, 11, 20, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem 1rem',
            marginTop: '1.25rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              Locally Computed Keccak-256 Hash of Your File:
            </div>
            <div className="font-mono" style={{ fontSize: '0.82rem', color: '#38bdf8', wordBreak: 'break-all' }}>
              {computedHash}
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Verification Result */}
      {isVerifying ? (
        <LoadingSpinner message="Calculating cryptographic hash..." />
      ) : verificationResult === 'match' ? (
        <div className="card" style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: '#34d399',
          }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#34d399', marginBottom: '0.5rem' }}>
            Evidence Verified!
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#e2e8f0', maxWidth: '650px', margin: '0 auto 1.5rem' }}>
            The cryptographic hash of the document matches the exact Keccak-256 hash sealed in <code>FundEvidenceTracker.sol</code>. Zero tampering has occurred since on-chain submission.
          </p>

          <div style={{
            background: 'rgba(7, 11, 20, 0.75)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            maxWidth: '650px',
            margin: '0 auto',
            textAlign: 'left',
            fontSize: '0.8rem',
          }}>
            <div style={{ color: '#34d399', fontWeight: '700', marginBottom: '0.3rem' }}>✓ Cryptographic Hash Match</div>
            <div className="font-mono" style={{ color: '#93c5fd', wordBreak: 'break-all' }}>{computedHash}</div>
          </div>
        </div>
      ) : verificationResult === 'mismatch' ? (
        <div className="card" style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.5)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: '#fb7185',
          }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fb7185', marginBottom: '0.5rem' }}>
            Evidence Does Not Match!
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#fecdd3', maxWidth: '650px', margin: '0 auto 1.5rem' }}>
            WARNING: The hash of the uploaded document does not correspond to the blockchain hash stored for this fund usage record. The file may have been altered, corrupted, or is not the genuine evidence.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '650px',
            margin: '0 auto',
            textAlign: 'left',
            fontSize: '0.8rem',
          }}>
            <div style={{ background: 'rgba(7, 11, 20, 0.75)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: '#f43f5e', fontWeight: '600' }}>Your File Hash:</div>
              <div className="font-mono" style={{ color: '#fb7185', wordBreak: 'break-all' }}>{computedHash}</div>
            </div>
            <div style={{ background: 'rgba(7, 11, 20, 0.75)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: '#60a5fa', fontWeight: '600' }}>On-Chain Expected Hash:</div>
              <div className="font-mono" style={{ color: '#93c5fd', wordBreak: 'break-all' }}>{blockchainHash}</div>
            </div>
          </div>
        </div>
      ) : null}

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1rem',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: '#fb7185',
          fontSize: '0.85rem',
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {computedHash && blockchainHash && !verificationResult && (
        <button
          onClick={handleManualVerify}
          className="btn btn-primary btn-lg"
          style={{ width: '100%' }}
        >
          Compare Hashes
        </button>
      )}
    </div>
  );
}
