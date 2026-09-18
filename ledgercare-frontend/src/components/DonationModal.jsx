import React, { useState } from 'react';
import { parseEther } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import { formatEth, shortenAddress } from '../utils/formatters';
import { parseContractError } from '../services/blockchain';
import { TARGET_CHAIN_ID, NETWORKS } from '../config/contracts';
import TransactionStatus from './TransactionStatus';
import { Heart, X, AlertCircle, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';

export default function DonationModal({ campaign, isOpen, onClose, onDonationSuccess }) {
  const { account, balance, isCorrectNetwork, connectWallet, switchNetwork } = useWallet();
  const { donationLedger } = useContract();

  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !campaign) return null;

  const quickAmounts = ['0.01', '0.05', '0.1', '0.5', '1.0'];

  const remainingWei = BigInt(campaign.targetAmount) - BigInt(campaign.raisedAmount);
  const remainingEth = formatEth(remainingWei, 4);

  const handleDonate = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!account) {
      setTxState('connecting');
      const connected = await connectWallet();
      if (!connected) {
        setTxState('idle');
        return;
      }
    }

    if (!isCorrectNetwork) {
      try {
        await switchNetwork(TARGET_CHAIN_ID);
      } catch (netErr) {
        setErrorMsg('Please switch to the supported blockchain network to donate.');
        return;
      }
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Please enter a valid donation amount in ETH.');
      return;
    }

    let donationWei;
    try {
      donationWei = parseEther(amount.toString());
    } catch {
      setErrorMsg('Invalid numerical amount.');
      return;
    }

    if (donationWei > remainingWei) {
      setErrorMsg(`Donation exceeds remaining target. Max allowable is ${remainingEth} ETH.`);
      return;
    }

    if (BigInt(balance) < donationWei) {
      setErrorMsg('Insufficient ETH balance in your wallet.');
      return;
    }

    try {
      setTxState('awaiting_signature');
      const tx = await donationLedger.donate(campaign.campaignId, {
        value: donationWei,
      });

      setTxHash(tx.hash);
      setTxState('confirming');

      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setTxState('confirmed');
        if (onDonationSuccess) {
          onDonationSuccess();
        }
      } else {
        setTxState('failed');
        setErrorMsg('Transaction reverted on blockchain.');
      }
    } catch (err) {
      console.error('Donation error:', err);
      const parsed = parseContractError(err);
      if (err.code === 4001 || err.code === 'ACTION_REJECTED') {
        setTxState('rejected');
      } else {
        setTxState('failed');
      }
      setErrorMsg(parsed);
    }
  };

  const handleClose = () => {
    setTxState('idle');
    setAmount('');
    setErrorMsg('');
    setTxHash('');
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={handleClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ec4899',
              }}>
                <Heart size={18} fill="currentColor" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>
                Donate to Campaign #{campaign.campaignId}
              </h3>
            </div>
            <button
              onClick={handleClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Campaign Target & Status
              </div>
              <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                {campaign.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Remaining to goal: <strong style={{ color: '#34d399' }}>{remainingEth} ETH</strong>
              </div>
            </div>

            <form onSubmit={handleDonate}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Donation Amount (ETH)</span>
                  {account && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      Balance: {formatEth(balance, 4)} ETH
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    step="0.001"
                    min="0.0001"
                    placeholder="e.g. 0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', paddingRight: '4rem', fontSize: '1.1rem', fontWeight: '600' }}
                    required
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: '700',
                      color: '#94a3b8',
                      fontSize: '0.85rem',
                    }}
                  >
                    ETH
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q)}
                    style={{
                      background: amount === q ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${amount === q ? 'var(--accent-blue)' : 'var(--border-subtle)'}`,
                      color: amount === q ? '#60a5fa' : '#cbd5e1',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {q} ETH
                  </button>
                ))}
              </div>

              {/* Transaction Summary Card */}
              <div style={{
                background: 'rgba(7, 11, 20, 0.8)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Donor Wallet:</span>
                  <span className="font-mono" style={{ color: '#ffffff' }}>
                    {account ? shortenAddress(account) : 'Not connected'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Network:</span>
                  <span style={{ color: '#ffffff' }}>
                    {NETWORKS[TARGET_CHAIN_ID]?.chainName || 'Hardhat Local'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Contract:</span>
                  <span className="font-mono" style={{ color: '#93c5fd' }}>
                    DonationLedger.sol
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fb7185',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
              >
                {!account ? (
                  <>
                    <Wallet size={16} />
                    <span>Connect Wallet to Donate</span>
                  </>
                ) : (
                  <>
                    <Heart size={16} fill="currentColor" />
                    <span>Confirm Donation of {amount || '0'} ETH</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Transaction Lifecycle Status Modal */}
      <TransactionStatus
        status={txState}
        txHash={txHash}
        errorMessage={errorMsg}
        onClose={handleClose}
        title="Donation Processing"
        successMessage={`Your donation of ${amount} ETH was confirmed! Campaign ledger updated.`}
      />
    </>
  );
}
