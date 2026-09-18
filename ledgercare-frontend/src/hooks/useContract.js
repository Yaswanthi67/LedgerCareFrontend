import { useMemo } from 'react';
import { Contract } from 'ethers';
import { useWallet } from './useWallet';
import {
  CONTRACT_ADDRESSES,
  CHARITY_REGISTRY_ABI,
  CAMPAIGN_MANAGER_ABI,
  DONATION_LEDGER_ABI,
  FUND_EVIDENCE_TRACKER_ABI,
} from '../config/contracts';

/**
 * Custom hook that returns ethers Contract instances connected to
 * the active signer (if available) or the read-only provider.
 */
export function useContract() {
  const { signer, activeProvider, isCorrectNetwork } = useWallet();

  const contracts = useMemo(() => {
    const runner = (isCorrectNetwork && signer) ? signer : activeProvider;
    if (!runner) return {};

    try {
      const charityRegistry = new Contract(
        CONTRACT_ADDRESSES.CharityRegistry,
        CHARITY_REGISTRY_ABI,
        runner
      );

      const campaignManager = new Contract(
        CONTRACT_ADDRESSES.CampaignManager,
        CAMPAIGN_MANAGER_ABI,
        runner
      );

      const donationLedger = new Contract(
        CONTRACT_ADDRESSES.DonationLedger,
        DONATION_LEDGER_ABI,
        runner
      );

      const fundEvidenceTracker = new Contract(
        CONTRACT_ADDRESSES.FundEvidenceTracker,
        FUND_EVIDENCE_TRACKER_ABI,
        runner
      );

      return {
        charityRegistry,
        campaignManager,
        donationLedger,
        fundEvidenceTracker,
        readOnly: !(isCorrectNetwork && signer),
      };
    } catch (err) {
      console.error('Error creating contract instances:', err);
      return {};
    }
  }, [signer, activeProvider, isCorrectNetwork]);

  return contracts;
}

export default useContract;
