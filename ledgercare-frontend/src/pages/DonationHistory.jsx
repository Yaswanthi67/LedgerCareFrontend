import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { fetchAllCampaigns, fetchCampaignDonations } from '../services/blockchain';
import { formatEth, formatDate, shortenAddress, getExplorerAddressLink } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart, Search, Filter, ExternalLink, RefreshCw } from 'lucide-react';

export default function DonationHistory() {
  const { activeProvider } = useWallet();

  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadGlobalDonations = async () => {
    if (!activeProvider) return;
    setIsLoading(true);
    try {
      const allCampaigns = await fetchAllCampaigns(activeProvider);
      const allDons = [];

      for (const camp of allCampaigns) {
        const cDons = await fetchCampaignDonations(camp.campaignId, activeProvider);
        cDons.forEach((d) => {
          allDons.push({
            ...d,
            campaignTitle: camp.title,
            charityName: camp.charityName,
          });
        });
      }

      // Sort newest first
      allDons.sort((a, b) => b.timestamp - a.timestamp);
      setDonations(allDons);
    } catch (err) {
      console.error('Error loading global donations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGlobalDonations();
  }, [activeProvider]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDonations(donations);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredDonations(
      donations.filter(
        (d) =>
          d.donor.toLowerCase().includes(q) ||
          d.campaignTitle.toLowerCase().includes(q) ||
          d.donationId.toString().includes(q)
      )
    );
  }, [donations, searchQuery]);

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
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
            Public Donation Ledger
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            All transparent peer-to-peer contributions recorded permanently in <code>DonationLedger.sol</code>.
          </p>
        </div>

        <button onClick={loadGlobalDonations} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search filter */}
      <div className="card" style={{ padding: '0.85rem 1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Filter by donor address, campaign title, or donation ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <LoadingSpinner message="Querying DonationLedger records from Ethereum..." />
        ) : filteredDonations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            No donations recorded yet on this network.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Donor Address</th>
                  <th>Date Recorded</th>
                  <th>Ledger Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d) => (
                  <tr key={`${d.campaignId}-${d.donationId}`}>
                    <td style={{ fontWeight: '600' }}>#{d.donationId}</td>
                    <td>
                      <Link
                        to={`/campaign/${d.campaignId}`}
                        style={{ color: '#60a5fa', fontWeight: '600', textDecoration: 'underline' }}
                      >
                        {d.campaignTitle} (#{d.campaignId})
                      </Link>
                    </td>
                    <td style={{ fontWeight: '700', color: '#34d399' }}>
                      {formatEth(d.amount, 4)} ETH
                    </td>
                    <td className="font-mono">
                      <a
                        href={getExplorerAddressLink(d.donor)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#93c5fd', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        {shortenAddress(d.donor)}
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>{formatDate(d.timestamp)}</td>
                    <td>
                      <span className="badge badge-verified">Immutable</span>
                    </td>
                    <td>
                      <Link to={`/campaign/${d.campaignId}`} className="btn btn-secondary btn-sm">
                        View Audit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
