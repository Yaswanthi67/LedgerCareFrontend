import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CampaignCard from '../components/CampaignCard';
import DonationModal from '../components/DonationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';

const CATEGORIES = ['All Categories', 'Education', 'Healthcare', 'Disaster Relief', 'Hunger & Nutrition', 'Elderly Care'];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('active');
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState(null);

  useEffect(() => {
    async function loadCampaigns() {
      setIsLoading(true);
      try {
        const res = await api.getCampaigns();
        setCampaigns(res.campaigns || []);
      } catch (err) {
        console.warn('Failed to load campaigns:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((camp) => {
    if (!camp) return false;
    const title = (camp.title || camp.campaignTitle || '').toLowerCase();
    const desc = (camp.description || '').toLowerCase();
    const charity = (camp.charityName || '').toLowerCase();
    const category = (camp.category || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    const catQuery = (selectedCategory || '').toLowerCase();

    const matchesCategory =
      selectedCategory === 'All Categories' ||
      category.includes(catQuery) ||
      title.includes(catQuery);

    const matchesSearch =
      !query ||
      title.includes(query) ||
      desc.includes(query) ||
      charity.includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.8rem',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#34d399',
          fontSize: '0.8rem',
          fontWeight: '700',
          marginBottom: '1rem',
        }}>
          <Sparkles size={14} />
          <span>Blockchain Verified Humanitarian Campaigns</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.75rem' }}>
          Explore Verified Campaigns
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
          Support audited social causes. Every rupee contributed is recorded transparently on smart contracts with immutable proof.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by campaign title, cause, or charity name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.6rem' }}
            />
          </div>

          {/* Sort Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
            >
              <option value="active">Active Campaigns</option>
              <option value="mostFunded">Highest Funded</option>
              <option value="goal">Goal Amount</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingTop: '1rem',
          marginTop: '1rem',
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '600',
                border: selectedCategory === cat
                  ? '1px solid #10b981'
                  : '1px solid var(--border-subtle)',
                background: selectedCategory === cat
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(15, 23, 42, 0.6)',
                color: selectedCategory === cat ? '#34d399' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <LoadingSpinner message="Querying campaigns from LedgerCare smart contracts..." />
      ) : filteredCampaigns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
            No campaigns matched your criteria
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Try resetting your filters or search terms.
          </p>
          <button
            onClick={() => { setSelectedCategory('All Categories'); setSearchQuery(''); }}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
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

      {/* ₹ Donation Modal */}
      {selectedCampaignForDonation && (
        <DonationModal
          campaign={selectedCampaignForDonation}
          isOpen={true}
          onClose={() => setSelectedCampaignForDonation(null)}
          onDonationSuccess={() => {
            api.getCampaigns().then((res) => setCampaigns(res.campaigns || []));
          }}
        />
      )}
    </div>
  );
}
