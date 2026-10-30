import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useWallet } from '../context/WalletContext';
import { formatInr, truncateHash, formatDate } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import {
  Upload,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Lock,
  Layers,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Wallet,
  Clock,
  History,
  RefreshCw,
} from 'lucide-react';

export default function CharityEvidenceUpload() {
  const [searchParams] = useSearchParams();
  const defaultCampaignId = searchParams.get('campaignId') || '1';

  const {
    account,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    switchNetwork,
    getContract,
  } = useWallet();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [campaignId, setCampaignId] = useState(defaultCampaignId);
  const [purpose, setPurpose] = useState('Purchase of educational supplies and textbooks');
  const [amount, setAmount] = useState('50000');
  const [documentType, setDocumentType] = useState('Official Bill / Invoice');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [uploadedData, setUploadedData] = useState(null);
  const [successBanner, setSuccessBanner] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCid, setCopiedCid] = useState(false);

  const [evidenceHistory, setEvidenceHistory] = useState([]);

  // Load campaigns & existing evidence history
  useEffect(() => {
    async function loadData() {
      try {
        const campRes = await api.getCampaigns().catch(() => ({ campaigns: [] }));
        if (campRes.campaigns && campRes.campaigns.length > 0) {
          setCampaigns(campRes.campaigns);
        }

        const evRes = await api.getAllEvidence().catch(() => ({ evidence: [] }));
        if (evRes.evidence) {
          setEvidenceHistory(evRes.evidence);
        }
      } catch (err) {
        console.warn('Load data note:', err);
      }
    }
    loadData();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  /**
   * Complete 11-Step Evidence Registration Workflow via MetaMask:
   * 1. Ensure MetaMask is connected.
   * 2. Send file to backend to generate SHA-256 hash & pin to IPFS (obtains CID).
   * 3. Backend prepares blockchain registration transaction parameters.
   * 4. Display transaction in MetaMask for charity user approval.
   * 5. Wait for block confirmation and retrieve transaction hash & status.
   * 6. Persist confirmed evidence in database.
   * 7. Display success & blockchain transaction details in LedgerCare.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select an evidence document file (invoice, bill, or receipt).');
      return;
    }

    // Step 1: Ensure MetaMask is connected
    let charityAccount = account;
    if (!isConnected || !charityAccount) {
      try {
        const connected = await connectWallet();
        if (!connected) {
          setErrorMessage('Please connect your MetaMask wallet to approve the blockchain evidence registration.');
          return;
        }
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts[0]) charityAccount = accounts[0].toLowerCase();
        }
      } catch (err) {
        setErrorMessage('Failed to connect MetaMask: ' + (err.message || 'Unknown error'));
        return;
      }
    }

    // If on wrong network, prompt to switch
    if (!isCorrectNetwork) {
      try {
        await switchNetwork();
      } catch (switchErr) {
        console.warn('Network switch warning:', switchErr);
      }
    }

    setIsUploading(true);
    setErrorMessage('');
    setSuccessBanner('');
    setUploadStep('Step 1/3: Computing SHA-256 hash in backend & pinning file to IPFS...');

    try {
      // Step 4 & 5: Backend generates original SHA-256 hash and uploads to IPFS to obtain CID
      const prepareRes = await api.prepareEvidence(selectedFile, {
        campaignId,
        purpose,
        amountInr: amount,
        uploadedWalletAddress: charityAccount,
      });

      if (!prepareRes.success || !prepareRes.cid || !prepareRes.preparedTx) {
        throw new Error(prepareRes.message || 'Failed to prepare IPFS CID and SHA-256 hash.');
      }

      const { preparedTx, cid, originalSha256Hash, fileName, fileSizeBytes, mimeType } = prepareRes;

      // Step 6 & 7: Display transaction in MetaMask for charity user approval
      setUploadStep('Step 2/3: Awaiting MetaMask transaction approval... (Please confirm in your MetaMask extension window)');

      const tracker = await getContract('FundEvidenceTracker');
      const targetCampId = Number(preparedTx.campaignId || campaignId || 1);

      let tx;
      try {
        // Prepare & send transaction to connected MetaMask wallet
        tx = await tracker.registerEvidence(
          targetCampId,
          preparedTx.ipfsCid,
          preparedTx.sha256Hash
        );
      } catch (mmErr) {
        if (
          mmErr.code === 4001 ||
          mmErr.message?.includes('rejected') ||
          mmErr.message?.includes('denied') ||
          mmErr.message?.includes('User rejected')
        ) {
          throw new Error('MetaMask Transaction Cancelled: You rejected the evidence registration approval in MetaMask.');
        }
        throw mmErr;
      }

      // Step 8: After confirmation, retrieve transaction hash and transaction status
      setUploadStep('Step 3/3: Transaction submitted! Waiting for block confirmation on Hardhat network...');
      const receipt = await tx.wait(1);

      const txHash = tx.hash || receipt.hash;
      const blockNumber = receipt.blockNumber;
      const statusText = receipt.status === 1 ? 'CONFIRMED' : 'REVERTED';

      // Retrieve on-chain evidenceId from event log if present
      let onChainEvidenceId = preparedTx.numericEvidenceId || 1;
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = tracker.interface.parseLog(log);
            if (parsed && parsed.name === 'EvidenceRegistered') {
              onChainEvidenceId = Number(parsed.args.evidenceId);
              break;
            }
          } catch {}
        }
      }

      // Persist confirmed evidence record in backend (MongoDB & JSON DB)
      const confirmRes = await api.confirmEvidence({
        evidenceId: preparedTx.evidenceId,
        campaignId: targetCampId,
        fileName: fileName || selectedFile.name,
        fileSizeBytes: fileSizeBytes || selectedFile.size,
        mimeType: mimeType || selectedFile.type,
        ipfsCid: cid,
        originalSha256Hash: originalSha256Hash,
        uploadedWalletAddress: charityAccount,
        blockchainTransactionHash: txHash,
        blockNumber: blockNumber,
        blockchainUsageId: onChainEvidenceId,
        purpose,
        amountInr: amount,
      });

      // Step 9: Display registration success and blockchain transaction details in LedgerCare
      const resultPayload = {
        fileName: fileName || selectedFile.name,
        fileSize: fileSizeBytes || selectedFile.size,
        cid: cid,
        originalSha256Hash: originalSha256Hash,
        transactionHash: txHash,
        blockNumber: blockNumber,
        status: statusText,
        url: prepareRes.url || `https://gateway.pinata.cloud/ipfs/${cid}`,
        campaignId: targetCampId,
        purpose,
        amount,
        evidenceId: confirmRes.evidence?.evidenceId || preparedTx.evidenceId,
        numericEvidenceId: onChainEvidenceId,
        uploadedWalletAddress: charityAccount,
        registrationTimestamp: new Date().toISOString(),
      };

      setSuccessBanner(
        `✓ Stored on IPFS (CID: ${cid.substring(0, 12)}...). ✓ Blockchain record created successfully via MetaMask confirmation (Txn: ${truncateHash(txHash, 8, 6)}).`
      );
      setUploadedData(resultPayload);
      setEvidenceHistory((prev) => [resultPayload, ...prev]);
    } catch (err) {
      console.error('Evidence upload/MetaMask confirmation failed:', err);
      setErrorMessage(err.message || 'Failed to complete evidence registration.');
    } finally {
      setIsUploading(false);
      setUploadStep('');
    }
  };

  const copyHash = () => {
    if (uploadedData?.originalSha256Hash) {
      navigator.clipboard.writeText(uploadedData.originalSha256Hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const copyCid = () => {
    if (uploadedData?.cid) {
      navigator.clipboard.writeText(uploadedData.cid);
      setCopiedCid(true);
      setTimeout(() => setCopiedCid(false), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '860px', margin: '1rem auto 3rem', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.9rem',
          borderRadius: '9999px',
          background: 'rgba(6, 182, 212, 0.12)',
          color: '#22d3ee',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '0.85rem',
          border: '1px solid rgba(6, 182, 212, 0.3)',
        }}>
          <FileCheck2 size={15} />
          <span>MetaMask Approval & IPFS Decentralized Registration</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
          Upload Expenditure Evidence
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto' }}>
          Upload bills, invoices, and receipts. LedgerCare computes the cryptographic SHA-256 hash in the backend, pins the original file to IPFS, and submits an on-chain registration transaction to MetaMask for charity approval.
        </p>
      </div>

      {/* Top Banner Alert (Matches SecureShare Video) */}
      {successBanner && (
        <div style={{
          padding: '0.9rem 1.25rem',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          fontSize: '0.88rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* 1 & 2. Connected MetaMask Web3 Wallet Card */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '1.15rem 1.4rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          }}>
            <Wallet size={22} color={isConnected ? '#34d399' : '#fbbf24'} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              METAMASK WEB3 WALLET:
            </div>
            <div className="font-mono" style={{ fontSize: '0.88rem', color: isConnected ? '#34d399' : '#e2e8f0', fontWeight: '600' }}>
              {isConnected ? account : 'Wallet Not Connected'}
            </div>
            {isConnected && (
              <div style={{ fontSize: '0.72rem', color: '#60a5fa', marginTop: '0.15rem' }}>
                Connected to Hardhat Localhost (Chain ID: 31337) &bull; Ready for MetaMask approval
              </div>
            )}
          </div>
        </div>

        <div>
          {isConnected ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              fontSize: '0.78rem',
              fontWeight: '700',
            }}>
              <Check size={14} />
              <span>✓ Connected</span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderColor: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                fontWeight: '700',
              }}
            >
              <Wallet size={15} />
              <span>🦊 Connect MetaMask Wallet</span>
            </button>
          )}
        </div>
      </div>

      {uploadedData ? (
        /* Upload Success View (Step 9) */
        <div className="card" style={{
          padding: '2.5rem 2rem',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)',
          marginBottom: '2.5rem',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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

            <span style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              padding: '0.25rem 0.85rem',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.4)',
            }}>
              METAMASK REGISTRATION CONFIRMED ✓
            </span>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', marginTop: '0.85rem' }}>
              Evidence Successfully Registered on Blockchain
            </h2>
          </div>

          <div style={{
            background: 'rgba(7, 11, 20, 0.85)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Evidence File</span>
              <strong style={{ color: '#ffffff' }}>{uploadedData.fileName}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Purpose</span>
              <span style={{ color: '#ffffff' }}>{uploadedData.purpose}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Amount Spent</span>
              <strong style={{ color: '#34d399' }}>{formatInr(uploadedData.amount)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Signing Charity Wallet</span>
              <span className="font-mono" style={{ color: '#93c5fd', fontSize: '0.82rem' }}>
                {uploadedData.uploadedWalletAddress}
              </span>
            </div>

            {/* IPFS CID */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>IPFS Storage CID</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <a
                  href={uploadedData.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#60a5fa', textDecoration: 'underline', fontSize: '0.82rem' }}
                  className="font-mono"
                >
                  {uploadedData.cid} ↗
                </a>
                <button
                  onClick={copyCid}
                  style={{ background: 'transparent', border: 'none', color: copiedCid ? '#34d399' : '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                  title="Copy IPFS CID"
                >
                  {copiedCid ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Blockchain TX */}
            {uploadedData.transactionHash && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Blockchain Transaction</span>
                <Link
                  to={`/transparency/blockchain?tx=${uploadedData.transactionHash}`}
                  className="font-mono"
                  style={{ color: '#a78bfa', textDecoration: 'underline', fontSize: '0.82rem' }}
                >
                  {truncateHash(uploadedData.transactionHash, 10, 8)}
                </Link>
              </div>
            )}

            {/* Block Number & Status */}
            {uploadedData.blockNumber && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Block Confirmation Status</span>
                <span style={{ color: '#34d399', fontWeight: '700', fontSize: '0.82rem' }}>
                  CONFIRMED (Block #{uploadedData.blockNumber})
                </span>
              </div>
            )}

            {/* Original SHA-256 Hash Display */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                  ORIGINAL REGISTERED SHA-256 HASH (BENCHMARK):
                </span>
                <button
                  onClick={copyHash}
                  style={{ background: 'transparent', border: 'none', color: copiedHash ? '#34d399' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}
                >
                  {copiedHash ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                  <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
              <div style={{
                background: 'rgba(7, 11, 20, 0.75)',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#34d399', wordBreak: 'break-all' }}>
                  {uploadedData.originalSha256Hash}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to={`/evidence/${uploadedData.evidenceId || 1}`}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <ShieldCheck size={16} />
              <span>Verify SHA-256 Authenticity Now</span>
            </Link>

            <button
              onClick={() => { setUploadedData(null); setSelectedFile(null); setSuccessBanner(''); }}
              className="btn btn-secondary"
            >
              Upload Another Document
            </button>
          </div>
        </div>
      ) : (
        /* Upload Form (Steps 3 - 7) */
        <div className="card" style={{ padding: '2.5rem 2rem', marginBottom: '2.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Campaign & Doc Type */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Associate with Campaign *</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="form-select"
                >
                  {campaigns.length > 0 ? (
                    campaigns.map((c) => (
                      <option key={c.campaignId} value={c.campaignId}>
                        #{c.campaignId}: {c.title || c.campaignTitle}
                      </option>
                    ))
                  ) : (
                    <option value="1">#1: Education Support Campaign</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Evidence Document Type *</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="form-select"
                >
                  <option value="Official Bill / Invoice">Official Bill / Invoice</option>
                  <option value="Vendor Receipt">Vendor Payment Receipt</option>
                  <option value="Beneficiary Photo">On-Ground Photo Evidence</option>
                  <option value="Audited Report">Chartered Accountant Audit Report</option>
                  <option value="Completion Certificate">Project Completion Certificate</option>
                </select>
              </div>
            </div>

            {/* Purpose & Amount */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Expenditure Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purchase of 250 school kits and textbooks"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Amount Spent in INR (₹) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* File Dropzone */}
            <div className="form-group">
              <label className="form-label">Supporting Evidence File (Bill / Invoice / Receipt) *</label>
              <div style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
              }}>
                <input
                  type="file"
                  id="evidenceFile"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="evidenceFile" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                  <Upload size={28} color="#22d3ee" />
                  <span style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: '600' }}>
                    {selectedFile ? selectedFile.name : 'Click to select bill, invoice, or receipt file'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    PDF, JPG, PNG, TXT supported (Raw bytes are hashed via SHA-256 in backend and pinned to IPFS)
                  </span>
                </label>
              </div>
            </div>

            {/* Selected File Details Box (Matches Video) */}
            {selectedFile && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.78rem',
              }}>
                <div>
                  <span style={{ color: '#94a3b8' }}>Selected File: </span>
                  <strong style={{ color: '#ffffff' }}>{selectedFile.name}</strong>
                  <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', color: '#60a5fa' }}>
                  <span>Hash: <code>SHA-256</code></span>
                  <span>&bull;</span>
                  <span>Storage: <code>IPFS</code></span>
                  <span>&bull;</span>
                  <span>Ledger: <code>FundEvidenceTracker.sol</code></span>
                </div>
              </div>
            )}

            {/* Real-time uploading & MetaMask approval stepper */}
            {isUploading && (
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93c5fd',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #60a5fa',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  flexShrink: 0,
                }} />
                <span>{uploadStep || 'Processing evidence upload and blockchain anchoring...'}</span>
              </div>
            )}

            {errorMessage && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading}
              className="btn btn-primary btn-lg"
              style={{
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                fontWeight: '700',
              }}
            >
              <Upload size={18} />
              <span>
                {isUploading
                  ? 'Processing MetaMask Approval...'
                  : 'Register Evidence on Blockchain via MetaMask'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* Campaign Evidence History Table */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="#60a5fa" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
              Registered Evidence History
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {evidenceHistory.length} Document(s) Registered
          </span>
        </div>

        {evidenceHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.88rem' }}>
            No evidence documents uploaded yet. Submit the form above to pin and register evidence.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: '#94a3b8' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>File Name</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Purpose</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Amount</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>IPFS CID</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Original SHA-256</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {evidenceHistory.map((ev, idx) => (
                  <tr key={ev.evidenceId || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#ffffff', fontWeight: '600' }}>
                      {ev.fileName}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {ev.purpose}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#34d399', fontWeight: '600' }}>
                      {formatInr(ev.amountInr || ev.amount || 0)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${ev.ipfsCid || ev.cid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono"
                        style={{ color: '#60a5fa', textDecoration: 'underline' }}
                      >
                        {truncateHash(ev.ipfsCid || ev.cid, 6, 4)} ↗
                      </a>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }} className="font-mono">
                      <span style={{ color: '#34d399' }}>
                        {truncateHash(ev.originalSha256Hash || ev.evidenceHash, 6, 4)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <Link
                        to={`/evidence/${ev.evidenceId || 1}`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                      >
                        Verify
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
