import React, { useState, useEffect } from 'react';
import { parseEther } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { fetchCampaignDetails, parseContractError } from '../services/blockchain';
import { uploadEvidenceToIPFS } from '../services/ipfs';
import { formatEth, formatDate, shortenAddress } from '../utils/formatters';
import TransactionStatus from '../components/TransactionStatus';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import {
  Building2,
  PlusCircle,
  ArrowDownToLine,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  X,
  Upload,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';

export default function CharityDashboard() {
  const {
    account,
    balance,
    connectWallet,
    isConnecting,
    isCharityVerified,
    charityData,
    refreshRole,
    activeProvider,
  } = useWallet();

  const { charityRegistry, campaignManager, donationLedger, fundEvidenceTracker } = useContract();

  // Data states
  const [charityCampaigns, setCharityCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals & form states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRecordUsageModal, setShowRecordUsageModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Transaction state
  const [txState, setTxState] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [txError, setTxError] = useState('');
  const [txSuccessMsg, setTxSuccessMsg] = useState('');

  // Form inputs: Registration
  const [regForm, setRegForm] = useState({
    organizationName: '',
    registrationNumber: '',
    email: '',
  });

  // Form inputs: Create Campaign
  const [campForm, setCampForm] = useState({
    title: '',
    description: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
  });

  // Form inputs: Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Form inputs: Record Usage & Evidence
  const [usageForm, setUsageForm] = useState({
    campaignId: '',
    amount: '',
    purpose: '',
    file: null,
  });

  // Load charity campaigns
  const loadCharityCampaigns = async () => {
    if (!account || !campaignManager) return;
    setIsLoading(true);
    try {
      const campIds = await campaignManager.getCharityCampaigns(account);
      const campList = [];

      for (const cId of campIds) {
        const idNum = Number(cId);
        const details = await fetchCampaignDetails(idNum, activeProvider);
        if (details) campList.push(details);
      }

      setCharityCampaigns(campList.reverse());
    } catch (err) {
      console.error('Error loading charity campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account && isCharityVerified) {
      loadCharityCampaigns();
    }
  }, [account, isCharityVerified, campaignManager]);

  // Handle Charity Registration
  const handleRegisterCharity = async (e) => {
    e.preventDefault();
    setTxError('');

    try {
      setTxState('awaiting_signature');
      const tx = await charityRegistry.registerCharity(
        regForm.organizationName,
        regForm.registrationNumber,
        regForm.email
      );

      setTxHash(tx.hash);
      setTxState('confirming');

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxState('confirmed');
        setTxSuccessMsg('Charity successfully registered and verified on-chain!');
        setShowRegisterModal(false);
        await refreshRole();
      } else {
        setTxState('failed');
        setTxError('Transaction reverted.');
      }
    } catch (err) {
      console.error('Charity registration error:', err);
      const parsed = parseContractError(err);
      if (err.code === 4001) {
        setTxState('rejected');
      } else {
        setTxState('failed');
      }
      setTxError(parsed);
    }
  };

  // Handle Create Campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setTxError('');

    try {
      const targetWei = parseEther(campForm.targetAmount);
      const startTimestamp = Math.floor(new Date(campForm.startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(campForm.endDate).getTime() / 1000);

      if (endTimestamp <= startTimestamp) {
        setToast({ message: 'End date must be after start date.', type: 'error' });
        return;
      }

      setTxState('awaiting_signature');
      const tx = await campaignManager.createCampaign(
        campForm.title,
        campForm.description,
        targetWei,
        startTimestamp,
        endTimestamp
      );

      setTxHash(tx.hash);
      setTxState('confirming');

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxState('confirmed');
        setTxSuccessMsg('Campaign successfully deployed on the blockchain!');
        setShowCreateCampaignModal(false);
        setCampForm({ title: '', description: '', targetAmount: '', startDate: '', endDate: '' });
        await loadCharityCampaigns();
      } else {
        setTxState('failed');
        setTxError('Transaction reverted.');
      }
    } catch (err) {
      console.error('Create campaign error:', err);
      const parsed = parseContractError(err);
      if (err.code === 4001) {
        setTxState('rejected');
      } else {
        setTxState('failed');
      }
      setTxError(parsed);
    }
  };

  // Handle Withdraw Funds
  const handleWithdrawFunds = async (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    setTxError('');

    try {
      const amountWei = parseEther(withdrawAmount);
      const availableWei = BigInt(selectedCampaign.raisedAmount) - BigInt(selectedCampaign.withdrawnAmount);

      if (amountWei > availableWei) {
        setToast({ message: 'Withdrawal amount exceeds available funds.', type: 'error' });
        return;
      }

      setTxState('awaiting_signature');
      const tx = await donationLedger.withdrawFunds(selectedCampaign.campaignId, amountWei);

      setTxHash(tx.hash);
      setTxState('confirming');

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxState('confirmed');
        setTxSuccessMsg(`Successfully withdrew ${withdrawAmount} ETH to charity wallet.`);
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        await loadCharityCampaigns();
      } else {
        setTxState('failed');
        setTxError('Withdrawal reverted.');
      }
    } catch (err) {
      console.error('Withdrawal error:', err);
      const parsed = parseContractError(err);
      if (err.code === 4001) {
        setTxState('rejected');
      } else {
        setTxState('failed');
      }
      setTxError(parsed);
    }
  };

  // Handle Complete Campaign
  const handleCompleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to finalize and mark this campaign as Completed?')) return;
    try {
      setTxState('awaiting_signature');
      const tx = await campaignManager.completeCampaign(campaignId);
      setTxHash(tx.hash);
      setTxState('confirming');
      await tx.wait();
      setTxState('confirmed');
      setTxSuccessMsg(`Campaign #${campaignId} marked as Completed.`);
      await loadCharityCampaigns();
    } catch (err) {
      const parsed = parseContractError(err);
      setTxState('failed');
      setTxError(parsed);
    }
  };

  // Handle Cancel Campaign
  const handleCancelCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to cancel this campaign? This action is irreversible on-chain.')) return;
    try {
      setTxState('awaiting_signature');
      const tx = await campaignManager.cancelCampaign(campaignId);
      setTxHash(tx.hash);
      setTxState('confirming');
      await tx.wait();
      setTxState('confirmed');
      setTxSuccessMsg(`Campaign #${campaignId} marked as Cancelled.`);
      await loadCharityCampaigns();
    } catch (err) {
      const parsed = parseContractError(err);
      setTxState('failed');
      setTxError(parsed);
    }
  };

  // Handle Record Fund Usage & Evidence Upload
  const handleRecordUsage = async (e) => {
    e.preventDefault();
    if (!usageForm.file) {
      setToast({ message: 'Please attach an evidence file (invoice, receipt, or photo).', type: 'error' });
      return;
    }
    setTxError('');

    try {
      setTxState('connecting'); // used here as uploading indicator
      setTxSuccessMsg('Uploading evidence file and computing cryptographic hash...');

      // 1. Upload to IPFS & calculate Keccak-256 hash
      const ipfsResult = await uploadEvidenceToIPFS(usageForm.file);

      const usageWei = parseEther(usageForm.amount);
      const decoratedPurpose = `${usageForm.purpose} [IPFS: ${ipfsResult.cid}]`;

      setTxState('awaiting_signature');
      const tx = await fundEvidenceTracker.recordFundUsage(
        usageForm.campaignId,
        usageWei,
        decoratedPurpose,
        ipfsResult.evidenceHash
      );

      setTxHash(tx.hash);
      setTxState('confirming');

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxState('confirmed');
        setTxSuccessMsg('Fund usage expenditure and cryptographic evidence hash recorded on-chain!');
        setShowRecordUsageModal(false);
        setUsageForm({ campaignId: '', amount: '', purpose: '', file: null });
        await loadCharityCampaigns();
      } else {
        setTxState('failed');
        setTxError('Transaction reverted.');
      }
    } catch (err) {
      console.error('Evidence recording error:', err);
      const parsed = parseContractError(err);
      if (err.code === 4001) {
        setTxState('rejected');
      } else {
        setTxState('failed');
      }
      setTxError(parsed);
    }
  };

  if (!account) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
        <Building2 size={48} color="#60a5fa" style={{ margin: '0 auto 1.5rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.75rem' }}>
          Charity Management Portal
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          Connect your authorized charity wallet to manage fundraising campaigns, withdraw contributions, and submit cryptographic proof of fund usage.
        </p>
        <button onClick={connectWallet} disabled={isConnecting} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
            Charity Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage transparent campaigns, withdraw raised funds, and submit IPFS evidence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadCharityCampaigns} className="btn btn-secondary" title="Refresh">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          {isCharityVerified && (
            <button
              onClick={() => setShowCreateCampaignModal(true)}
              className="btn btn-primary"
            >
              <PlusCircle size={16} />
              <span>Create Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Charity Status Card */}
      <div className="card" style={{ padding: '1.75rem' }}>
        {isCharityVerified && charityData ? (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}>
                <Building2 size={30} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
                    {charityData.organizationName}
                  </h2>
                  <span className="badge badge-verified">Verified Charity</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Reg No: <strong>{charityData.registrationNumber}</strong> • Email: {charityData.email}
                </div>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Wallet: {charityData.walletAddress}
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => {
                  setUsageForm((prev) => ({ ...prev, campaignId: charityCampaigns[0]?.campaignId || '' }));
                  setShowRecordUsageModal(true);
                }}
                className="btn btn-outline"
                disabled={charityCampaigns.length === 0}
              >
                <FileCheck2 size={16} />
                <span>Submit Evidence & Fund Usage</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <AlertCircle size={40} color="#f59e0b" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
              Charity Wallet Not Verified Yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Your connected wallet (<code>{shortenAddress(account)}</code>) is not yet registered in <code>CharityRegistry.sol</code>. To maintain absolute transparency, charities must have their credential hash whitelisted by the admin before registration.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn btn-primary"
              >
                Register Charity
              </button>
              <a href="/admin" className="btn btn-secondary">
                Admin Whitelist Portal
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Charity's Campaigns Section */}
      {isCharityVerified && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>
              Your Deployed Campaigns ({charityCampaigns.length})
            </h3>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Querying your campaigns from the smart contract..." />
          ) : charityCampaigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <FolderOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                You have not created any campaigns with this charity wallet yet.
              </p>
              <button
                onClick={() => setShowCreateCampaignModal(true)}
                className="btn btn-primary"
              >
                <PlusCircle size={16} /> Deploy Your First Campaign
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Target</th>
                    <th>Raised</th>
                    <th>Withdrawn</th>
                    <th>Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {charityCampaigns.map((c) => {
                    const availableWei = BigInt(c.raisedAmount) - BigInt(c.withdrawnAmount);
                    const canWithdraw = availableWei > 0n && c.status !== 2;
                    const isActive = c.status === 0;

                    return (
                      <tr key={c.campaignId}>
                        <td style={{ fontWeight: '600' }}>#{c.campaignId}</td>
                        <td style={{ fontWeight: '600', color: '#ffffff' }}>{c.title}</td>
                        <td>{formatEth(c.targetAmount)} ETH</td>
                        <td style={{ color: '#34d399', fontWeight: '600' }}>
                          {formatEth(c.raisedAmount)} ETH
                        </td>
                        <td style={{ color: '#fbbf24' }}>
                          {formatEth(c.withdrawnAmount)} ETH
                        </td>
                        <td style={{ color: '#60a5fa', fontWeight: '700' }}>
                          {formatEth(availableWei)} ETH
                        </td>
                        <td>
                          {c.status === 0 && <span className="badge badge-active">Active</span>}
                          {c.status === 1 && <span className="badge badge-completed">Completed</span>}
                          {c.status === 2 && <span className="badge badge-cancelled">Cancelled</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {canWithdraw && (
                              <button
                                onClick={() => {
                                  setSelectedCampaign(c);
                                  setWithdrawAmount(formatEth(availableWei));
                                  setShowWithdrawModal(true);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#fbbf24' }}
                                title="Withdraw funds to charity wallet"
                              >
                                <ArrowDownToLine size={14} /> Withdraw
                              </button>
                            )}

                            {isActive && (
                              <>
                                <button
                                  onClick={() => handleCompleteCampaign(c.campaignId)}
                                  className="btn btn-secondary btn-sm"
                                  title="Mark Completed"
                                >
                                  Complete
                                </button>
                                <button
                                  onClick={() => handleCancelCampaign(c.campaignId)}
                                  className="btn btn-danger btn-sm"
                                  title="Cancel Campaign"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            <a
                              href={`/campaign/${c.campaignId}`}
                              className="btn btn-secondary btn-sm"
                            >
                              Details
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Register Charity */}
      {showRegisterModal && (
        <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
                Register Charity on Blockchain
              </h3>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Enter the exact registered credentials whitelisted for your wallet. The smart contract calculates <code>keccak256(abi.encode(org, regNo, email, wallet))</code> to verify authorization.
              </p>

              <form onSubmit={handleRegisterCharity}>
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red Cross Relief Foundation"
                    className="form-input"
                    value={regForm.organizationName}
                    onChange={(e) => setRegForm({ ...regForm, organizationName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NGO-IND-2024-001"
                    className="form-input"
                    value={regForm.registrationNumber}
                    onChange={(e) => setRegForm({ ...regForm, registrationNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@charity.org"
                    className="form-input"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Charity Wallet Address</label>
                  <input
                    type="text"
                    disabled
                    value={account}
                    className="form-input font-mono"
                    style={{ opacity: 0.7 }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                  Submit On-Chain Registration
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Campaign */}
      {showCreateCampaignModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateCampaignModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
                Deploy New Campaign
              </h3>
              <button onClick={() => setShowCreateCampaignModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateCampaign}>
                <div className="form-group">
                  <label className="form-label">Campaign Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clean Drinking Water for Rural Schools"
                    className="form-input"
                    value={campForm.title}
                    onChange={(e) => setCampForm({ ...campForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    placeholder="Detail the mission, beneficiaries, and milestones of this campaign..."
                    className="form-textarea"
                    value={campForm.description}
                    onChange={(e) => setCampForm({ ...campForm, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Funding Goal (ETH)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    required
                    placeholder="e.g. 5.0"
                    className="form-input"
                    value={campForm.targetAmount}
                    onChange={(e) => setCampForm({ ...campForm, targetAmount: e.target.value })}
                  />
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-input"
                      value={campForm.startDate}
                      onChange={(e) => setCampForm({ ...campForm, startDate: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-input"
                      value={campForm.endDate}
                      onChange={(e) => setCampForm({ ...campForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                  Deploy Campaign to CampaignManager.sol
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Withdraw Funds */}
      {showWithdrawModal && selectedCampaign && (
        <div className="modal-backdrop" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
                Withdraw Raised Funds
              </h3>
              <button onClick={() => setShowWithdrawModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
              }}>
                <div>Campaign: <strong>{selectedCampaign.title}</strong></div>
                <div style={{ color: '#34d399', marginTop: '0.25rem' }}>
                  Available to Withdraw: <strong>{formatEth(BigInt(selectedCampaign.raisedAmount) - BigInt(selectedCampaign.withdrawnAmount))} ETH</strong>
                </div>
              </div>

              <form onSubmit={handleWithdrawFunds}>
                <div className="form-group">
                  <label className="form-label">Withdrawal Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.0001"
                    required
                    className="form-input"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  ETH will be transferred directly from <code>DonationLedger.sol</code> to your charity wallet. You can then submit expenditure evidence.
                </p>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                  Confirm Withdrawal
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Record Fund Usage & Evidence Upload */}
      {showRecordUsageModal && (
        <div className="modal-backdrop" onClick={() => setShowRecordUsageModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>
                Record Fund Usage & Evidence
              </h3>
              <button onClick={() => setShowRecordUsageModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Under <code>FundEvidenceTracker.sol</code>, charities must record fund usage backed by cryptographic evidence. The evidence document will be hashed with Keccak-256 and stored on IPFS.
              </p>

              <form onSubmit={handleRecordUsage}>
                <div className="form-group">
                  <label className="form-label">Select Campaign</label>
                  <select
                    required
                    className="form-select"
                    value={usageForm.campaignId}
                    onChange={(e) => setUsageForm({ ...usageForm, campaignId: e.target.value })}
                  >
                    <option value="">-- Choose Campaign --</option>
                    {charityCampaigns.map((c) => (
                      <option key={c.campaignId} value={c.campaignId}>
                        #{c.campaignId} - {c.title} (Withdrawn: {formatEth(c.withdrawnAmount)} ETH)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Expenditure Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.0001"
                    required
                    placeholder="e.g. 0.5"
                    className="form-input"
                    value={usageForm.amount}
                    onChange={(e) => setUsageForm({ ...usageForm, amount: e.target.value })}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Note: Cannot exceed cumulative withdrawn funds for this campaign.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Purpose / Description of Expenditure</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Purchased 50 water filtration units from Supplier Inc."
                    className="form-input"
                    value={usageForm.purpose}
                    onChange={(e) => setUsageForm({ ...usageForm, purpose: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Attach Proof / Receipt Document</label>
                  <div style={{
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: 'rgba(7, 11, 20, 0.4)',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="file"
                      id="evidenceFileInput"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUsageForm({ ...usageForm, file: e.target.files[0] });
                        }
                      }}
                    />
                    <label htmlFor="evidenceFileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload size={24} color="#60a5fa" />
                      <span style={{ fontSize: '0.85rem', color: '#ffffff' }}>
                        {usageForm.file ? usageForm.file.name : 'Click to select invoice, bill, or receipt (PDF/Image)'}
                      </span>
                      {usageForm.file && (
                        <span style={{ fontSize: '0.72rem', color: '#34d399' }}>
                          {(usageForm.file.size / 1024).toFixed(1)} KB • Ready for Keccak-256 Hashing
                        </span>
                      )}
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
                  Upload to IPFS & Record On-Chain
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
