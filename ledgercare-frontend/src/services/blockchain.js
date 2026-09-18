import { Contract, formatEther, parseEther } from 'ethers';
import {
  CONTRACT_ADDRESSES,
  CHARITY_REGISTRY_ABI,
  CAMPAIGN_MANAGER_ABI,
  DONATION_LEDGER_ABI,
  FUND_EVIDENCE_TRACKER_ABI,
} from '../config/contracts';

/**
 * Parses user-friendly error messages from contract reverts or Web3 errors.
 */
export function parseContractError(error) {
  if (!error) return 'An unknown error occurred.';

  // MetaMask rejection
  if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
    return 'Transaction was rejected in wallet.';
  }

  // Insufficient funds
  if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
    return 'Insufficient ETH balance in your wallet to complete this transaction (including gas fees).';
  }

  // Solidity revert reason extraction
  if (error.reason) return error.reason;
  if (error.shortMessage) return error.shortMessage;

  if (error.data) {
    if (typeof error.data === 'string' && error.data.length > 10) {
      return `Contract reverted: ${error.data}`;
    }
  }

  const msg = error.message || '';
  if (msg.includes('execution reverted:')) {
    const match = msg.match(/execution reverted: ([^",]+)/);
    if (match && match[1]) return match[1].trim();
  }

  if (msg.includes('user rejected action')) {
    return 'Transaction rejected by user.';
  }

  return 'Transaction failed. Please verify campaign requirements and account permissions.';
}

/**
 * Fetches all campaigns by querying campaign IDs starting from 1 until Campaign does not exist.
 */
export async function fetchAllCampaigns(provider) {
  if (!provider) return [];
  try {
    const campaignManager = new Contract(
      CONTRACT_ADDRESSES.CampaignManager,
      CAMPAIGN_MANAGER_ABI,
      provider
    );
    const charityRegistry = new Contract(
      CONTRACT_ADDRESSES.CharityRegistry,
      CHARITY_REGISTRY_ABI,
      provider
    );

    const campaigns = [];
    let campaignId = 1;
    let keepFetching = true;

    while (keepFetching && campaignId <= 100) {
      try {
        const camp = await campaignManager.getCampaign(campaignId);
        if (!camp || Number(camp.campaignId) === 0) {
          keepFetching = false;
          break;
        }

        let orgName = 'Unknown Charity';
        try {
          const charity = await charityRegistry.getCharity(camp.charityId);
          if (charity && charity.organizationName) {
            orgName = charity.organizationName;
          }
        } catch {}

        campaigns.push({
          campaignId: Number(camp.campaignId),
          charityId: Number(camp.charityId),
          charityWallet: camp.charityWallet,
          charityName: orgName,
          title: camp.title,
          description: camp.description,
          targetAmount: camp.targetAmount.toString(),
          raisedAmount: camp.raisedAmount.toString(),
          withdrawnAmount: camp.withdrawnAmount.toString(),
          startDate: Number(camp.startDate),
          endDate: Number(camp.endDate),
          status: Number(camp.status), // 0: Active, 1: Completed, 2: Cancelled
        });

        campaignId++;
      } catch (err) {
        // Revert "Campaign does not exist" marks end of collection
        keepFetching = false;
      }
    }

    return campaigns;
  } catch (err) {
    console.error('Error fetching all campaigns:', err);
    return [];
  }
}

/**
 * Fetches a single campaign by ID along with its charity profile.
 */
export async function fetchCampaignDetails(campaignId, provider) {
  if (!provider || !campaignId) return null;
  try {
    const campaignManager = new Contract(
      CONTRACT_ADDRESSES.CampaignManager,
      CAMPAIGN_MANAGER_ABI,
      provider
    );
    const charityRegistry = new Contract(
      CONTRACT_ADDRESSES.CharityRegistry,
      CHARITY_REGISTRY_ABI,
      provider
    );

    const camp = await campaignManager.getCampaign(campaignId);
    if (!camp || Number(camp.campaignId) === 0) return null;

    let charityInfo = null;
    try {
      const c = await charityRegistry.getCharity(camp.charityId);
      charityInfo = {
        charityId: Number(c.charityId),
        organizationName: c.organizationName,
        registrationNumber: c.registrationNumber,
        email: c.email,
        walletAddress: c.walletAddress,
        verified: c.verified,
        registeredAt: Number(c.registeredAt),
      };
    } catch (cErr) {
      console.warn('Charity details could not be loaded:', cErr);
    }

    return {
      campaignId: Number(camp.campaignId),
      charityId: Number(camp.charityId),
      charityWallet: camp.charityWallet,
      charity: charityInfo,
      title: camp.title,
      description: camp.description,
      targetAmount: camp.targetAmount.toString(),
      raisedAmount: camp.raisedAmount.toString(),
      withdrawnAmount: camp.withdrawnAmount.toString(),
      startDate: Number(camp.startDate),
      endDate: Number(camp.endDate),
      status: Number(camp.status),
    };
  } catch (err) {
    console.error(`Error fetching campaign ${campaignId}:`, err);
    return null;
  }
}

/**
 * Fetches all donations for a specific campaign.
 */
export async function fetchCampaignDonations(campaignId, provider) {
  if (!provider || !campaignId) return [];
  try {
    const donationLedger = new Contract(
      CONTRACT_ADDRESSES.DonationLedger,
      DONATION_LEDGER_ABI,
      provider
    );

    const donationIds = await donationLedger.getCampaignDonations(campaignId);
    const donations = [];

    for (const dId of donationIds) {
      try {
        const don = await donationLedger.getDonation(dId);
        donations.push({
          donationId: Number(don.donationId),
          campaignId: Number(don.campaignId),
          donor: don.donor,
          amount: don.amount.toString(),
          timestamp: Number(don.timestamp),
        });
      } catch (err) {
        console.warn(`Failed to fetch donation ${dId}:`, err);
      }
    }

    return donations.reverse(); // newest first
  } catch (err) {
    console.error(`Error fetching donations for campaign ${campaignId}:`, err);
    return [];
  }
}

/**
 * Fetches all fund usages and evidence for a specific campaign.
 */
export async function fetchCampaignFundUsages(campaignId, provider) {
  if (!provider || !campaignId) return [];
  try {
    const tracker = new Contract(
      CONTRACT_ADDRESSES.FundEvidenceTracker,
      FUND_EVIDENCE_TRACKER_ABI,
      provider
    );

    const usageIds = await tracker.getCampaignFundUsages(campaignId);
    const usages = [];

    for (const uId of usageIds) {
      try {
        const usage = await tracker.getFundUsage(uId);
        usages.push({
          usageId: Number(usage.usageId),
          campaignId: Number(usage.campaignId),
          charityWallet: usage.charityWallet,
          amount: usage.amount.toString(),
          purpose: usage.purpose,
          evidenceHash: usage.evidenceHash,
          timestamp: Number(usage.timestamp),
        });
      } catch (err) {
        console.warn(`Failed to fetch fund usage ${uId}:`, err);
      }
    }

    return usages.reverse(); // newest first
  } catch (err) {
    console.error(`Error fetching fund usages for campaign ${campaignId}:`, err);
    return [];
  }
}

/**
 * Fetches all donations made by a specific donor wallet.
 */
export async function fetchDonorDonations(donorAddress, provider) {
  if (!provider || !donorAddress) return [];
  try {
    const donationLedger = new Contract(
      CONTRACT_ADDRESSES.DonationLedger,
      DONATION_LEDGER_ABI,
      provider
    );
    const campaignManager = new Contract(
      CONTRACT_ADDRESSES.CampaignManager,
      CAMPAIGN_MANAGER_ABI,
      provider
    );

    const donationIds = await donationLedger.getDonorDonations(donorAddress);
    const results = [];

    for (const dId of donationIds) {
      try {
        const don = await donationLedger.getDonation(dId);
        let campaignTitle = `Campaign #${don.campaignId}`;
        try {
          const camp = await campaignManager.getCampaign(don.campaignId);
          if (camp && camp.title) campaignTitle = camp.title;
        } catch {}

        results.push({
          donationId: Number(don.donationId),
          campaignId: Number(don.campaignId),
          campaignTitle,
          donor: don.donor,
          amount: don.amount.toString(),
          timestamp: Number(don.timestamp),
        });
      } catch (err) {
        console.warn(`Failed to fetch donor donation ${dId}:`, err);
      }
    }

    return results.reverse();
  } catch (err) {
    console.error(`Error fetching donor donations for ${donorAddress}:`, err);
    return [];
  }
}

/**
 * Fetches all verified charities from CharityRegistry.
 */
export async function fetchAllCharities(provider) {
  if (!provider) return [];
  try {
    const registry = new Contract(
      CONTRACT_ADDRESSES.CharityRegistry,
      CHARITY_REGISTRY_ABI,
      provider
    );

    const charities = [];
    let charityId = 1;
    let keepFetching = true;

    while (keepFetching && charityId <= 100) {
      try {
        const c = await registry.getCharity(charityId);
        if (!c || Number(c.charityId) === 0) {
          keepFetching = false;
          break;
        }

        charities.push({
          charityId: Number(c.charityId),
          organizationName: c.organizationName,
          registrationNumber: c.registrationNumber,
          email: c.email,
          walletAddress: c.walletAddress,
          verified: c.verified,
          registeredAt: Number(c.registeredAt),
        });

        charityId++;
      } catch {
        keepFetching = false;
      }
    }

    return charities;
  } catch (err) {
    console.error('Error fetching charities:', err);
    return [];
  }
}

/**
 * Computes platform-level analytics from real smart-contract records.
 */
export async function fetchPlatformStats(provider) {
  const campaigns = await fetchAllCampaigns(provider);
  const charities = await fetchAllCharities(provider);

  let totalRaisedWei = 0n;
  let totalWithdrawnWei = 0n;
  let activeCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;

  campaigns.forEach((c) => {
    totalRaisedWei += BigInt(c.raisedAmount);
    totalWithdrawnWei += BigInt(c.withdrawnAmount);
    if (c.status === 0) activeCount++;
    else if (c.status === 1) completedCount++;
    else if (c.status === 2) cancelledCount++;
  });

  return {
    totalCampaigns: campaigns.length,
    activeCampaigns: activeCount,
    completedCampaigns: completedCount,
    cancelledCampaigns: cancelledCount,
    totalRaisedEth: formatEther(totalRaisedWei),
    totalWithdrawnEth: formatEther(totalWithdrawnWei),
    verifiedCharitiesCount: charities.length,
  };
}
