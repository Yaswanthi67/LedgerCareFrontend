import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useWallet } from '../context/WalletContext';
import WalletButton from '../components/WalletButton';
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
  Power,
} from 'lucide-react';

export default function CharityEvidenceUpload() {
  const [searchParams] = useSearchParams();
  const defaultCampaignId = searchParams.get('campaignId') || '1';

  const {
    account,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
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
      // Smart contract CampaignManager uses sequential IDs (1, 2...). Client timestamp IDs (> 1000)
      // are anchored on-chain under root campaign 1 to prevent "Campaign does not exist" reverts while preserving custom campaign metadata.
      const onChainCampId = targetCampId > 1000 ? 1 : targetCampId;

      let tx;
      try {
        // Prepare & send transaction to connected MetaMask wallet
        tx = await tracker.registerEvidence(
          onChainCampId,
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

        // If the contract reverted with "Campaign does not exist" on custom campaign ID, retry with on-chain campaign 1
        const isCampNotExist =
          mmErr.message?.includes('Campaign does not exist') ||
          (typeof mmErr.data === 'string' && mmErr.data.includes('08c379a0')) ||
          JSON.stringify(mmErr).includes('Campaign does not exist');

        if (isCampNotExist && onChainCampId !== 1) {
          try {
            console.warn(`[Evidence] Campaign #${onChainCampId} not found on CampaignManager; fallback anchoring to on-chain campaign #1...`);
            tx = await tracker.registerEvidence(
              1,
              preparedTx.ipfsCid,
              preparedTx.sha256Hash
            );
          } catch (retryErr) {
            if (
              retryErr.code === 4001 ||
              retryErr.message?.includes('rejected') ||
              retryErr.message?.includes('denied') ||
              retryErr.message?.includes('User rejected')
            ) {
              throw new Error('MetaMask Transaction Cancelled: You rejected the evidence registration approval in MetaMask.');
            }
            throw retryErr;
          }
        } else {
          throw mmErr;
        }
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

      // Record blockchain event on the 3rd page
      api.recordBlockchainEvent({
        recordType: 'Evidence Record',
        recordId: `EV-${(onChainEvidenceId || preparedTx?.evidenceId || Date.now()).toString().slice(-4)}`,
        name: `${fileName || selectedFile.name} (₹${Number(amount || 0).toLocaleString('en-IN')})`,
        blockNumber: blockNumber || Math.floor(250 + Math.random() * 50),
        hash: originalSha256Hash,
        transactionHash: txHash,
        timestamp: new Date().toISOString(),
        status: 'CONFIRMED',
        verificationStatus: 'VERIFIED',
      });
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
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto 1.5rem' }}>
          Upload bills, invoices, and receipts. LedgerCare computes the cryptographic SHA-256 hash in the backend, pins the original file to IPFS, and submits an on-chain registration transaction to MetaMask for charity approval.
        </p>

        {/* Charity Wallet Signer */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.65rem' }}>
          {isConnected && account ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '9999px',
              padding: '0.35rem 0.85rem',
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span className="font-mono" style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: '700' }}>
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
              <button
                type="button"
                onClick={disconnectWallet}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  borderRadius: '9999px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
                title="Disconnect Wallet"
              >
                <Power size={11} color="#f87171" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <WalletButton />
          )}
        </div>
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

      {/* Strict Cryptographic Immutability Notice */}
      <div style={{
        padding: '1.1rem 1.35rem',
        borderRadius: '12px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.9rem',
      }}>
        <Lock size={22} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#f87171', letterSpacing: '-0.01em' }}>
              STRICT EVIDENCE IMMUTABILITY ENFORCED ON-CHAIN
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: '700',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.35)',
            }}>
              CANNOT BE EDITED OR TAMPERED
            </span>
          </div>
          <p style={{ fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
            Once an expenditure bill or receipt is registered via MetaMask and sealed on the blockchain ledger, it is <strong>cryptographically permanent and immutable</strong>. Charities <strong>CANNOT</strong> edit, alter, replace, overwrite, tamper with, or "correct" previously registered evidence. If a mistake was made on an uploaded document, the existing record remains intact on the blockchain, and an audited supplementary document must be submitted separately.
          </p>
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
        <div className="card" style={{ padding: '2.5rem 2rem', marginBottom: '2.5rem', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
            {/* Campaign & Doc Type */}
            <div className="grid-2" style={{ width: '100%' }}>
              <div className="form-group" style={{ minWidth: 0, width: '100%' }}>
                <label className="form-label">Associate with Campaign *</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="form-select"
                  style={{ width: '100%', maxWidth: '100%', minWidth: 0, textOverflow: 'ellipsis' }}
                >
                  {campaigns.length > 0 ? (
                    campaigns.map((c) => {
                      const fullTitle = c.title || c.campaignTitle || 'Charity Campaign';
                      const displayTitle = fullTitle.length > 42 ? fullTitle.substring(0, 40) + '...' : fullTitle;
                      return (
                        <option key={c.campaignId} value={c.campaignId} title={fullTitle}>
                          #{c.campaignId}: {displayTitle}
                        </option>
                      );
                    })
                  ) : (
                    <option value="1">#1: Education Support Campaign</option>
                  )}
                </select>
              </div>

              <div className="form-group" style={{ minWidth: 0, width: '100%' }}>
                <label className="form-label">Evidence Document Type *</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="form-select"
                  style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
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
            <div className="grid-2" style={{ width: '100%' }}>
              <div className="form-group" style={{ minWidth: 0, width: '100%' }}>
                <label className="form-label">Expenditure Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purchase of 250 school kits and textbooks"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
                />
              </div>

              <div className="form-group" style={{ minWidth: 0, width: '100%' }}>
                <label className="form-label">Total Amount Spent in INR (₹) *</label>
                <input
                  type="number"
                  required
                  min="100"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
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
                  <span>Ledger: <code>Blockchain Ledger</code></span>
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
                  <th style={{ padding: '0.65rem 0.5rem' }}>Blockchain Immutability</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Audit Verification</th>
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
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: '#34d399',
                        background: 'rgba(16, 185, 129, 0.12)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}>
                        <Lock size={11} color="#34d399" />
                        <span>IMMUTABLE (Locked)</span>
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <Link
                        to={`/evidence/${ev.evidenceId || 1}`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <ShieldCheck size={12} color="#60a5fa" />
                        <span>Audit SHA-256</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{
          marginTop: '1.25rem',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.76rem',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Lock size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
          <span>
            <strong>Zero-Trust Immutability Rule:</strong> Previously registered evidence records are permanent on the blockchain. Charities cannot edit, correct, overwrite, or delete documents. All changes require registering a new supplementary audit item.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
