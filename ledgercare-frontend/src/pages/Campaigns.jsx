import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { fetchAllCampaigns } from '../services/blockchain';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, PlusCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Campaigns() {
  const { activeProvider, userRole, isCharityVerified } = useWallet();

  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | '0' (active) | '1' (completed) | '2' (cancelled)
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);

  const loadCampaigns = async () => {
    if (!activeProvider) return;
    setIsLoading(true);
    try {
      const data = await fetchAllCampaigns(activeProvider);
      setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [activeProvider]);

  // Apply search & status filter
  useEffect(() => {
    let result = [...campaigns];

    if (statusFilter !== 'all') {
      const targetStatus = parseInt(statusFilter, 10);
      result = result.filter((c) => c.status === targetStatus);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.charityName && c.charityName.toLowerCase().includes(q)) ||
          c.charityWallet.toLowerCase().includes(q)
      );
    }

    setFilteredCampaigns(result);
  }, [campaigns, statusFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
            Campaign Explorer
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Discover and back verified charity campaigns recorded permanently on the blockchain.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadCampaigns}
            className="btn btn-secondary"
            title="Refresh Blockchain Data"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          {isCharityVerified && (
            <Link to="/charity" className="btn btn-primary">
              <PlusCircle size={16} />
              <span>Create Campaign</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by title, charity, or wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                background: statusFilter === 'all' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: statusFilter === 'all' ? '#60a5fa' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === 'all' ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)'}`,
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              All ({campaigns.length})
            </button>
            <button
              onClick={() => setStatusFilter('0')}
              style={{
                background: statusFilter === '0' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: statusFilter === '0' ? '#34d399' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === '0' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Active ({campaigns.filter((c) => c.status === 0).length})
            </button>
            <button
              onClick={() => setStatusFilter('1')}
              style={{
                background: statusFilter === '1' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: statusFilter === '1' ? '#60a5fa' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === '1' ? 'rgba(59, 130, 246, 0.4)' : 'var(--border-subtle)'}`,
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Completed ({campaigns.filter((c) => c.status === 1).length})
            </button>
            <button
              onClick={() => setStatusFilter('2')}
              style={{
                background: statusFilter === '2' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                color: statusFilter === '2' ? '#fb7185' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === '2' ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle)'}`,
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancelled ({campaigns.filter((c) => c.status === 2).length})
            </button>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <LoadingSpinner message="Querying campaigns from CampaignManager contract..." />
      ) : filteredCampaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <p style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '0.5rem' }}>
            No campaigns found matching your criteria.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Try adjusting your search query or filter settings.
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {filteredCampaigns.map((camp) => (
            <CampaignCard
              key={camp.campaignId}
              campaign={camp}
              onDonateClick={(c) => setSelectedCampaignForDonation(c)}
            />
          ))}
        </div>
      )}

      {/* Donation Modal */}
      {selectedCampaignForDonation && (
        <DonationModal
          campaign={selectedCampaignForDonation}
          isOpen={true}
          onClose={() => setSelectedCampaignForDonation(null)}
          onDonationSuccess={() => loadCampaigns()}
        />
      )}
    </div>
  );
}
