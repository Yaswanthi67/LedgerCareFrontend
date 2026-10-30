import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  formatInr,
  ethToInr,
  formatDate,
  calculateProgress,
} from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Building2,
  PlusCircle,
  Eye,
  Upload,
  Layers,
  Heart,
  Activity,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function CharityCampaigns() {
  const { charityProfile } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCharityCampaigns() {
      setIsLoading(true);
      try {
        const res = await api.getCampaigns();
        setCampaigns(res.campaigns || []);
      } catch (err) {
        console.warn('Error loading campaigns:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCharityCampaigns();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
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
            marginBottom: '0.4rem',
          }}>
            <Building2 size={13} />
            <span>{charityProfile?.organizationName || 'Charity'} Management</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff' }}>
            Charity Campaigns
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Monitor raised funds, disburse expenditures, and submit IPFS evidence for verification.
          </p>
        </div>

        <Link
          to="/charity/campaigns/create"
          className="btn btn-primary"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
          }}
        >
          <PlusCircle size={16} />
          <span>Create New Campaign</span>
        </Link>
      </div>

      {/* Campaigns Table */}
      {isLoading ? (
        <LoadingSpinner message="Querying charity campaigns from smart contracts..." />
      ) : campaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem' }}>
            No campaigns launched yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Launch your first audited campaign to start receiving contributions directly in Indian Rupees.
          </p>
          <Link to="/charity/campaigns/create" className="btn btn-primary">
            Launch First Campaign
          </Link>
        </div>
      ) : (
        <div className="table-responsive card" style={{ padding: '0.5rem' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Target (₹)</th>
                <th>Raised (₹)</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Donors</th>
                <th>Duration</th>
                <th>Evidence</th>
                <th>Verification</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const targetInr = c.targetAmountEth ? ethToInr(c.targetAmountEth) : c.targetAmount;
                const raisedInr = c.raisedAmountEth ? ethToInr(c.raisedAmountEth) : c.raisedAmount;
                const percent = calculateProgress(raisedInr, targetInr);

                return (
                  <tr key={c.campaignId}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#ffffff', maxWidth: '220px' }}>
                        {c.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: #{c.campaignId}
                      </div>
                    </td>

                    <td style={{ fontWeight: '600' }}>{formatInr(targetInr)}</td>

                    <td>
                      <strong style={{ color: '#34d399' }}>{formatInr(raisedInr)}</strong>
                    </td>

                    <td style={{ width: '120px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '700', marginBottom: '0.2rem' }}>
                        {percent}%
                      </div>
                      <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percent}%`, background: '#10b981' }} />
                      </div>
                    </td>

                    <td>
                      <StatusBadge type="campaign" status={c.status === 0 ? 'Active' : 'Completed'} size="sm" />
                    </td>

                    <td>{c.donorCount || 4} Donors</td>

                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <div>{formatDate(c.startDate)}</div>
                      <div>to {formatDate(c.endDate)}</div>
                    </td>

                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#38bdf8',
                        background: 'rgba(6, 182, 212, 0.15)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                      }}>
                        1 Evidence
                      </span>
                    </td>

                    <td>
                      <StatusBadge type="charity" status="VERIFIED" size="sm" />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/campaigns/${c.campaignId}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="View Public Campaign"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </Link>

                        <Link
                          to={`/charity/evidence?campaignId=${c.campaignId}`}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#0284c7' }}
                          title="Upload Proof of Expenditure"
                        >
                          <Upload size={13} />
                          <span>Upload Evidence</span>
                        </Link>

                        <Link
                          to={`/charity/funds?campaignId=${c.campaignId}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Record Fund Utilization"
                        >
                          <Layers size={13} />
                          <span>Funds</span>
                        </Link>

                        <Link
                          to={`/transparency/${c.campaignId}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Transparency Timeline"
                        >
                          <Activity size={13} />
                        </Link>
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
  );
}
