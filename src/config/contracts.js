// ==========================================
// AVALANCHE FUJI C-CHAIN CONFIGURATION
// ==========================================
export const AVALANCHE_FUJI_CHAIN_ID = 43113;
export const AVALANCHE_FUJI_CHAIN_ID_HEX = '0xa869';

// Primary network: Avalanche Fuji C-Chain Testnet
export const CHAIN_ID = Number(import.meta.env?.VITE_CHAIN_ID || AVALANCHE_FUJI_CHAIN_ID);
export const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

export const SUPPORTED_CHAIN_IDS = [AVALANCHE_FUJI_CHAIN_ID];

export const isSupportedChain = (chainId) => {
  if (!chainId) return false;
  return Number(chainId) === AVALANCHE_FUJI_CHAIN_ID;
};

export const AVALANCHE_FUJI_NETWORK = {
  chainId: AVALANCHE_FUJI_CHAIN_ID_HEX,
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: [
    'https://api.avax-test.network/ext/bc/C/rpc',
    'https://avalanche-fuji-c-chain-rpc.publicnode.com',
  ],
  blockExplorerUrls: ['https://testnet.snowtrace.io'],
};

export const getRpcUrl = () => {
  if (import.meta.env?.VITE_RPC_URL) {
    return import.meta.env.VITE_RPC_URL;
  }
  return 'https://api.avax-test.network/ext/bc/C/rpc';
};

export const getNetworkConfig = () => AVALANCHE_FUJI_NETWORK;

export const getNetworkName = (chainId) => {
  const id = Number(chainId);
  if (id === AVALANCHE_FUJI_CHAIN_ID) return 'Avalanche Fuji C-Chain';
  return 'Wrong Network (Switch to Avalanche Fuji)';
};

export const getNetworkExplorerUrl = (txOrAddress, type = 'tx') => {
  if (!txOrAddress) return null;
  return `https://testnet.snowtrace.io/${type}/${txOrAddress}`;
};

export const CONTRACT_ADDRESSES = {
  CharityRegistry: import.meta.env?.VITE_CHARITY_REGISTRY_ADDRESS || '0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE',
  CampaignManager: import.meta.env?.VITE_CAMPAIGN_MANAGER_ADDRESS || '0x68B1D87F95878fE05B998F19b66F4baba5De1aed',
  DonationLedger: import.meta.env?.VITE_DONATION_LEDGER_ADDRESS || '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c',
  FundEvidenceTracker: import.meta.env?.VITE_FUND_EVIDENCE_TRACKER_ADDRESS || '0x59b670e9fA9D0A427751Af201D676719a970857b',
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
  'function recordDonation(uint256 campaignId, uint256 amount) external',
  'function recordWithdrawal(uint256 campaignId, uint256 amount) external',
  'function setDonationLedger(address _donationLedger) external',
  'function donationLedger() external view returns (address)',
  'function charityRegistry() external view returns (address)',
  'function campaigns(uint256) external view returns (uint256 campaignId, uint256 charityId, address charityWallet, string title, string description, uint256 targetAmount, uint256 raisedAmount, uint256 withdrawnAmount, uint256 startDate, uint256 endDate, uint8 status)',
  'event CampaignCreated(uint256 indexed campaignId, uint256 indexed charityId, address indexed charityWallet, string title, uint256 targetAmount, uint256 startDate, uint256 endDate)',
  'event CampaignStatusUpdated(uint256 indexed campaignId, uint8 status)',
  'event RaisedAmountUpdated(uint256 indexed campaignId, uint256 amount, uint256 totalRaised)',
  'event FundsWithdrawn(uint256 indexed campaignId, address indexed charityWallet, uint256 amount, uint256 timestamp)',
];

export const DONATION_LEDGER_ABI = [
  'function recordDonation(uint256 campaignId, uint256 amountInPaise, string memory donationReference) external returns (uint256)',
  'function donate(uint256 campaignId) external payable',
  'function withdrawFunds(uint256 campaignId, uint256 amount) external',
  'function getDonationById(uint256 donationId) external view returns (tuple(uint256 donationId, uint256 campaignId, address donor, uint256 amountInPaise, string donationReference, uint256 timestamp))',
  'function getDonation(uint256 donationId) external view returns (tuple(uint256 donationId, uint256 campaignId, address donor, uint256 amountInPaise, string donationReference, uint256 timestamp))',
  'function getDonationsByDonor(address donor) external view returns (uint256[] memory)',
  'function getDonationsByCampaign(uint256 campaignId) external view returns (uint256[] memory)',
  'function getCampaignDonationTotal(uint256 campaignId) external view returns (uint256)',
  'function getBalance() external view returns (uint256)',
  'function usedReferences(string) external view returns (bool)',
  'function campaignManager() external view returns (address)',
  'event DonationRecorded(uint256 indexed donationId, uint256 indexed campaignId, address indexed donor, uint256 amountInPaise, string donationReference, uint256 timestamp)',
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
