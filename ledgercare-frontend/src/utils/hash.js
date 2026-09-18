import { AbiCoder, keccak256, toUtf8Bytes } from 'ethers';

const abiCoder = AbiCoder.defaultAbiCoder();

/**
 * Computes keccak256(abi.encode(organizationName, registrationNumber, email, wallet))
 * Matches CharityRegistry.sol getCredentialHash implementation exactly.
 */
export function computeCredentialHash(organizationName, registrationNumber, email, walletAddress) {
  if (!organizationName || !registrationNumber || !email || !walletAddress) {
    throw new Error('All credential parameters (orgName, regNumber, email, wallet) are required');
  }
  const encoded = abiCoder.encode(
    ['string', 'string', 'string', 'address'],
    [organizationName.trim(), registrationNumber.trim(), email.trim(), walletAddress.trim()]
  );
  return keccak256(encoded);
}

/**
 * Computes keccak256 hash of a file ArrayBuffer.
 * Provides client-side immutable evidence hashing.
 */
export async function computeFileKeccak256(file) {
  if (!file) throw new Error('File is required for hash computation');
  const buffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(buffer);
  return keccak256(uint8);
}

/**
 * Computes keccak256 of a plain text string.
 */
export function computeTextKeccak256(text) {
  return keccak256(toUtf8Bytes(text));
}
