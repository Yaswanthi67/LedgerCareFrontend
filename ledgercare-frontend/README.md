# LedgerCare – Blockchain-Based Transparent Charity Management System (Frontend)

LedgerCare is a modern Web3 transparent charity management application built to connect directly with Ethereum smart contracts. It guarantees end-to-end transparency: charities are authenticated on-chain, donations are recorded immutably, fund usage is documented, and evidence documents are cryptographically verified using Keccak-256 and IPFS.

---

## 🚀 Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite (Lightning fast HMR)
- **Language**: Pure JavaScript (ES6+, JSX) — *No TypeScript*
- **Blockchain Library**: `ethers.js` v6
- **Routing**: `react-router-dom` v6
- **Icons**: `lucide-react`
- **Styling**: Premium Web3 Dark Theme with custom glassmorphic cards and responsive layouts
- **Source of Truth**: [LedgerCareBlockchain Repository](https://github.com/Yaswanthi67/LedgerCareBlockchain.git)

---

## 📋 Smart Contract Architecture & Deployed Addresses

All 4 contracts deployed from the source repository are integrated:

| Contract | Address (`deployed-addresses.json`) | Purpose |
| :--- | :--- | :--- |
| **`CharityRegistry`** | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Whitelists credential hashes, registers verified charities |
| **`CampaignManager`** | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` | Deploys campaigns, manages lifecycle (Active/Completed/Cancelled) |
| **`DonationLedger`** | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` | Receives direct ETH donations, allows charity withdrawals |
| **`FundEvidenceTracker`** | `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9` | Tracks fund expenditures and stores Keccak-256 evidence hashes |

---

## 📦 Installation & Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration is preset for Hardhat Local Node (Chain ID `31337`).

### 3. Run Development Server
```bash
npm run dev
```
The frontend will launch at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## 🦊 MetaMask & Blockchain Setup

### Connecting to Hardhat Local Node:
1. Start your Hardhat node in the `LedgerCareBlockchain` repository:
   ```bash
   npx hardhat node
   ```
2. In MetaMask, add the custom RPC network:
   - **Network Name**: Hardhat Localhost
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
3. Import one of Hardhat's pre-funded private keys into MetaMask for testing.

### Connecting to Sepolia Testnet:
Update `.env`:
```env
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://rpc.sepolia.org
```

---

## 📁 Project Structure

```
ledgercare-frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .env
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Responsive header, role badge, wallet trigger
│   │   ├── Footer.jsx              # Contract addresses, network status
│   │   ├── CampaignCard.jsx        # Campaign card with progress & donate CTA
│   │   ├── CampaignProgress.jsx    # Raised vs target visualization
│   │   ├── TransactionStatus.jsx   # 8-state transaction modal
│   │   ├── EvidenceCard.jsx        # Fund usage card with IPFS & verify links
│   │   ├── AuditTimeline.jsx       # Chronological on-chain event trail
│   │   ├── DonationModal.jsx       # Interactive donation flow
│   │   ├── LoadingSpinner.jsx      # Loading states
│   │   └── Toast.jsx               # Floating notifications
│   ├── context/
│   │   └── WalletContext.jsx       # MetaMask provider, role detection, chain switch
│   ├── hooks/
│   │   ├── useWallet.js            # Wallet hook
│   │   └── useContract.js          # Ethers contract instances
│   ├── config/
│   │   └── contracts.js            # Contract ABIs, addresses, network configs
│   ├── services/
│   │   ├── blockchain.js           # Smart contract queries & data aggregation
│   │   └── ipfs.js                 # Pinata IPFS file upload & CID generation
│   ├── utils/
│   │   ├── formatters.js           # ETH, address, date formatting
│   │   └── hash.js                 # Keccak-256 hashing for files & credentials
│   ├── styles/
│   │   └── global.css              # Dark Web3 theme & glassmorphic styling
│   ├── pages/
│   │   ├── Home.jsx                # Landing page & platform metrics
│   │   ├── Campaigns.jsx           # Campaign explorer & filtering
│   │   ├── CampaignDetails.jsx     # Detail view, donation history, audit timeline
│   │   ├── DonorDashboard.jsx      # Personal donation portfolio
│   │   ├── CharityDashboard.jsx    # Campaign creation, withdrawals, evidence upload
│   │   ├── AdminDashboard.jsx      # Credential whitelister & governance
│   │   ├── DonationHistory.jsx     # Global public donation ledger
│   │   ├── EvidenceVerification.jsx# Cryptographic file verification
│   │   └── NotFound.jsx            # 404 handler
│   ├── App.jsx                     # Router configuration
│   └── main.jsx                    # Application entry point
```

---

## 🔐 Cryptographic Integrity & Evidence Verification

1. **Charity Whitelisting**:
   Charities can only register if their credential hash matches:
   $$\text{credentialHash} = \text{keccak256}(\text{abi.encode}(\text{name}, \text{regNo}, \text{email}, \text{walletAddress}))$$
   This is whitelisted on-chain by the deployer/admin via `addValidRegistrationCredential`.

2. **Evidence Hashing**:
   When a charity records expenditure, the invoice/receipt is uploaded to IPFS and hashed using **Keccak-256**. The hash is saved permanently in `FundEvidenceTracker.sol`.

3. **Auditor Verification Tool (`/verify`)**:
   Anyone can drop an invoice file into the Evidence Verifier. The application computes the file's hash locally in the browser and checks it against the smart contract. If a single byte has been modified, the app detects the tampering and displays:
   🔴 **"Evidence Does Not Match!"**

---

## 📄 License
MIT
