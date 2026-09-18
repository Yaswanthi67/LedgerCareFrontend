// Centralized Smart Contract Configuration for LedgerCare

export const NETWORKS = {
  31337: {
    chainId: '0x7a69', // 31337 in hex
    chainName: 'Hardhat Localhost',
    rpcUrls: ['http://127.0.0.1:8545'],
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: null,
  },
  11155111: {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    rpcUrls: ['https://rpc.sepolia.org'],
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
};

export const CONTRACT_ADDRESSES = {
  CharityRegistry:
    import.meta.env.VITE_CHARITY_REGISTRY_ADDRESS ||
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  CampaignManager:
    import.meta.env.VITE_CAMPAIGN_MANAGER_ADDRESS ||
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  DonationLedger:
    import.meta.env.VITE_DONATION_LEDGER_ADDRESS ||
    '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  FundEvidenceTracker:
    import.meta.env.VITE_FUND_EVIDENCE_TRACKER_ADDRESS ||
    '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
};

export const TARGET_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || 31337);
export const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545';

// Contract ABIs
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
  'function validRegistrationCredentials(bytes32) external view returns (bool)',
  'function credentialUsed(bytes32) external view returns (bool)',
  'event RegistrationCredentialAdded(bytes32 indexed credentialHash)',
  'event CharityRegistered(uint256 indexed charityId, string organizationName, address indexed walletAddress, uint256 timestamp)',
  'event CharityVerificationUpdated(uint256 indexed charityId, bool verified, uint256 timestamp)',
];

export const CAMPAIGN_MANAGER_ABI = [
  'function setDonationLedger(address _donationLedger) external',
  'function createCampaign(string memory title, string memory description, uint256 targetAmount, uint256 startDate, uint256 endDate) external returns (uint256)',
  'function getCampaign(uint256 campaignId) external view returns (tuple(uint256 campaignId, uint256 charityId, address charityWallet, string title, string description, uint256 targetAmount, uint256 raisedAmount, uint256 withdrawnAmount, uint256 startDate, uint256 endDate, uint8 status))',
  'function getCampaignForDonation(uint256 campaignId) external view returns (uint256 targetAmount, uint256 raisedAmount, uint256 startDate, uint256 endDate, uint8 status)',
  'function getCampaignForWithdrawal(uint256 campaignId) external view returns (address charityWallet, uint256 raisedAmount, uint256 withdrawnAmount, uint8 status)',
  'function getCharityCampaigns(address charityWallet) external view returns (uint256[] memory)',
  'function completeCampaign(uint256 campaignId) external',
  'function cancelCampaign(uint256 campaignId) external',
  'function recordDonation(uint256 campaignId, uint256 amount) external',
  'function recordWithdrawal(uint256 campaignId, uint256 amount) external',
  'function charityRegistry() external view returns (address)',
  'function donationLedger() external view returns (address)',
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
  'function campaignManager() external view returns (address)',
  'function donations(uint256) external view returns (uint256 donationId, uint256 campaignId, address donor, uint256 amount, uint256 timestamp)',
  'event DonationRecorded(uint256 indexed donationId, uint256 indexed campaignId, address indexed donor, uint256 amount, uint256 timestamp)',
  'event FundsWithdrawn(uint256 indexed campaignId, address indexed charityWallet, uint256 amount, uint256 timestamp)',
];

export const FUND_EVIDENCE_TRACKER_ABI = [
  'function recordFundUsage(uint256 campaignId, uint256 amount, string memory purpose, bytes32 evidenceHash) external',
  'function getFundUsage(uint256 usageId) external view returns (tuple(uint256 usageId, uint256 campaignId, address charityWallet, uint256 amount, string purpose, bytes32 evidenceHash, uint256 timestamp))',
  'function getCampaignFundUsages(uint256 campaignId) external view returns (uint256[] memory)',
  'function getEvidenceHash(uint256 usageId) external view returns (bytes32)',
  'function campaignManager() external view returns (address)',
  'function fundUsages(uint256) external view returns (uint256 usageId, uint256 campaignId, address charityWallet, uint256 amount, string purpose, bytes32 evidenceHash, uint256 timestamp)',
  'event FundUsageRecorded(uint256 indexed usageId, uint256 indexed campaignId, address indexed charityWallet, uint256 amount, string purpose, bytes32 evidenceHash, uint256 timestamp)',
];

export const CAMPAIGN_STATUS = {
  0: 'Active',
  1: 'Completed',
  2: 'Cancelled',
};
