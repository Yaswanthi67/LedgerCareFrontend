export const HARDHAT_CHAIN_ID = 31337;
export const HARDHAT_CHAIN_ID_HEX = '0x7a69';

export const getRpcUrl = () => {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    // When accessed from another device (LAN IP or public tunnel/domain), use backend RPC proxy
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `${window.location.origin}/api/rpc`;
    }
  }
  return 'http://127.0.0.1:8545';
};

export const getHardhatNetworkConfig = () => {
  const rpc = getRpcUrl();
  return {
    chainId: HARDHAT_CHAIN_ID_HEX,
    chainName: 'Hardhat Node (LedgerCare)',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [rpc],
    blockExplorerUrls: null,
  };
};

export const HARDHAT_NETWORK_CONFIG = getHardhatNetworkConfig();

export const CONTRACT_ADDRESSES = {
  CharityRegistry: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  CampaignManager: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  DonationLedger: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  FundEvidenceTracker: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
};

export const CHARITY_REGISTRY_ABI = [
  'function addValidRegistrationCredential(bytes32 credentialHash) external',
  'function registerCharity(string memory organizationName, string memory registrationNumber, string memory email) external',
  'function getCharity(uint256 charityId) external view returns (tuple(uint256 charityId, string organizationName, string registrationNumber, string email, address walletAddress, bool verified, uint256 registeredAt))',
  'function isCharityVerified(uint256 charityId) external view returns (bool)',
  'function getCharityIdByWallet(address wallet) external view returns (uint256)',
  'function getCredentialHash(string memory organizationName, string memory registrationNumber, string memory email, address wallet) public pure returns (bytes32)',
  'function isCredentialValid(bytes32 credentialHash) external view returns (bool)',
  'function charities(uint256) external view returns (uint256 charityId, string organizationName, string registrationNumber, string email, address walletAddress, bool verified, uint256 registeredAt)',
  'function walletToCharityId(address) external view returns (uint256)',
  'event RegistrationCredentialAdded(bytes32 indexed credentialHash)',
  'event CharityRegistered(uint256 indexed charityId, string organizationName, address indexed walletAddress, uint256 timestamp)',
  'event CharityVerificationUpdated(uint256 indexed charityId, bool verified, uint256 timestamp)',
];

export const CAMPAIGN_MANAGER_ABI = [
  'function createCampaign(string memory title, string memory description, uint256 targetAmount, uint256 startDate, uint256 endDate) external returns (uint256)',
  'function getCampaign(uint256 campaignId) external view returns (tuple(uint256 campaignId, uint256 charityId, address charityWallet, string title, string description, uint256 targetAmount, uint256 raisedAmount, uint256 withdrawnAmount, uint256 startDate, uint256 endDate, uint8 status))',
  'function getCampaignForDonation(uint256 campaignId) external view returns (uint256 targetAmount, uint256 raisedAmount, uint256 startDate, uint256 endDate, uint8 status)',
  'function getCampaignForWithdrawal(uint256 campaignId) external view returns (address charityWallet, uint256 raisedAmount, uint256 withdrawnAmount, uint8 status)',
  'function getCharityCampaigns(address charityWallet) external view returns (uint256[] memory)',
  'function completeCampaign(uint256 campaignId) external',
  'function cancelCampaign(uint256 campaignId) external',
  'function campaigns(uint256) external view returns (uint256 campaignId, uint256 charityId, address charityWallet, string title, string description, uint256 targetAmount, uint256 raisedAmount, uint256 withdrawnAmount, uint256 startDate, uint256 endDate, uint8 status)',
  'event CampaignCreated(uint256 indexed campaignId, uint256 indexed charityId, address indexed charityWallet, string title, uint256 targetAmount, uint256 startDate, uint256 endDate)',
  'event CampaignStatusUpdated(uint256 indexed campaignId, uint8 status)',
  'event RaisedAmountUpdated(uint256 indexed campaignId, uint256 amount, uint256 totalRaised)',
  'event FundsWithdrawn(uint256 indexed campaignId, address indexed charityWallet, uint256 amount, uint256 timestamp)',
];

export const DONATION_LEDGER_ABI = [
  'function donate(uint256 campaignId) external payable',
  'function withdrawFunds(uint256 campaignId, uint256 amount) external',
  'function getDonation(uint256 donationId) external view returns (tuple(uint256 donationId, uint256 campaignId, address donor, uint256 amount, uint256 timestamp))',
  'function getCampaignDonations(uint256 campaignId) external view returns (uint256[] memory)',
  'function getDonorDonations(address donor) external view returns (uint256[] memory)',
  'function getBalance() external view returns (uint256)',
  'event DonationRecorded(uint256 indexed donationId, uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 timestamp)',
  'event FundsWithdrawn(uint256 indexed campaignId, address indexed charityWallet, uint256 amount, uint256 timestamp)',
];

export const FUND_EVIDENCE_TRACKER_ABI = [
  'function registerEvidence(uint256 campaignId, string memory ipfsCid, bytes32 sha256Hash) external returns (uint256)',
  'function getEvidenceRecord(uint256 evidenceId) external view returns (tuple(uint256 evidenceId, uint256 campaignId, address charityWallet, string ipfsCid, bytes32 sha256Hash, uint256 timestamp))',
  'function getCampaignEvidenceList(uint256 campaignId) external view returns (uint256[] memory)',
  'event EvidenceRegistered(uint256 indexed evidenceId, uint256 indexed campaignId, address indexed charityWallet, string ipfsCid, bytes32 sha256Hash, uint256 timestamp)',
  'function recordFundUsage(uint256 campaignId, uint256 amount, string memory purpose, bytes32 evidenceHash) external',
  'function getFundUsage(uint256 usageId) external view returns (tuple(uint256 usageId, uint256 campaignId, address charityWallet, uint256 amount, string purpose, bytes32 evidenceHash, uint256 timestamp))',
  'function getCampaignFundUsages(uint256 campaignId) external view returns (uint256[] memory)',
  'function getEvidenceHash(uint256 usageId) external view returns (bytes32)',
  'event FundUsageRecorded(uint256 indexed usageId, uint256 indexed campaignId, address indexed charityWallet, uint256 amount, string purpose, bytes32 evidenceHash, uint256 timestamp)',
];
