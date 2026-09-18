import { formatEther as ethersFormatEther } from 'ethers';
import { TARGET_CHAIN_ID, NETWORKS } from '../config/contracts';

export function shortenAddress(address) {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatEth(weiAmount, decimals = 4) {
  if (weiAmount === undefined || weiAmount === null) return '0';
  try {
    const etherStr = ethersFormatEther(weiAmount);
    const num = parseFloat(etherStr);
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    if (num < 0.0001) return '<0.0001';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  } catch (err) {
    return '0';
  }
}

export function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  try {
    const ms = Number(timestamp) * 1000;
    const date = new Date(ms);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
}

export function getExplorerTxLink(txHash, chainId = TARGET_CHAIN_ID) {
  if (!txHash) return '#';
  const network = NETWORKS[chainId];
  if (network && network.blockExplorerUrls && network.blockExplorerUrls[0]) {
    return `${network.blockExplorerUrls[0]}/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
}

export function getExplorerAddressLink(address, chainId = TARGET_CHAIN_ID) {
  if (!address) return '#';
  const network = NETWORKS[chainId];
  if (network && network.blockExplorerUrls && network.blockExplorerUrls[0]) {
    return `${network.blockExplorerUrls[0]}/address/${address}`;
  }
  return `https://etherscan.io/address/${address}`;
}

export function calculateProgress(raised, target) {
  try {
    const r = BigInt(raised || 0);
    const t = BigInt(target || 1);
    if (t === 0n) return 0;
    const percent = Number((r * 10000n) / t) / 100;
    return Math.min(Math.max(percent, 0), 100);
  } catch {
    return 0;
  }
}
