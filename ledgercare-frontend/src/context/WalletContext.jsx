import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcProvider, Contract } from 'ethers';
import {
  TARGET_CHAIN_ID,
  RPC_URL,
  NETWORKS,
  CONTRACT_ADDRESSES,
  CHARITY_REGISTRY_ABI,
} from '../config/contracts';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [readProvider, setReadProvider] = useState(null);
  const [error, setError] = useState(null);

  // User Role State: 'guest' | 'donor' | 'charity' | 'admin'
  const [userRole, setUserRole] = useState('guest');
  const [charityData, setCharityData] = useState(null);
  const [isCharityVerified, setIsCharityVerified] = useState(false);

  // Initialize read-only provider for immediate data loading without wallet
  useEffect(() => {
    try {
      const fallbackProvider = new JsonRpcProvider(RPC_URL);
      setReadProvider(fallbackProvider);
    } catch (err) {
      console.warn('Fallback JSON-RPC provider failed to initialize:', err);
    }
  }, []);

  // Update user balance
  const updateBalance = useCallback(async (walletAddress, prov) => {
    if (!walletAddress || !prov) return;
    try {
      const rawBal = await prov.getBalance(walletAddress);
      setBalance(rawBal.toString());
    } catch (err) {
      console.warn('Failed to fetch balance:', err);
    }
  }, []);

  // Detect role from blockchain (CharityRegistry)
  const detectUserRole = useCallback(async (walletAddress, prov) => {
    if (!walletAddress || !prov) {
      setUserRole('guest');
      setCharityData(null);
      setIsCharityVerified(false);
      return;
    }

    try {
      const registryContract = new Contract(
        CONTRACT_ADDRESSES.CharityRegistry,
        CHARITY_REGISTRY_ABI,
        prov
      );

      const charityId = await registryContract.getCharityIdByWallet(walletAddress);
      const cIdNum = Number(charityId);

      if (cIdNum > 0) {
        const verified = await registryContract.isCharityVerified(charityId);
        const details = await registryContract.getCharity(charityId);
        setIsCharityVerified(verified);
        setCharityData({
          charityId: cIdNum,
          organizationName: details.organizationName,
          registrationNumber: details.registrationNumber,
          email: details.email,
          walletAddress: details.walletAddress,
          verified: details.verified,
          registeredAt: Number(details.registeredAt),
        });
        setUserRole('charity');
      } else {
        setUserRole('donor');
        setCharityData(null);
        setIsCharityVerified(false);
      }
    } catch (err) {
      console.warn('Error detecting user role from CharityRegistry:', err);
      setUserRole('donor');
    }
  }, []);

  // Switch network in MetaMask
  const switchNetwork = async (targetChain = TARGET_CHAIN_ID) => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }
    const targetHex = `0x${targetChain.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetHex }],
      });
      return true;
    } catch (switchError) {
      // 4902: Unrecognized chain, request to add it
      if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
        const networkConfig = NETWORKS[targetChain];
        if (networkConfig) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig],
            });
            return true;
          } catch (addError) {
            throw new Error(`Failed to add network to MetaMask: ${addError.message}`);
          }
        }
      }
      throw switchError;
    }
  };

  // Connect MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not detected. Please install MetaMask extension to interact with the blockchain.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found.');
      }

      const currentNetwork = await browserProvider.getNetwork();
      const currentChainId = Number(currentNetwork.chainId);
      const activeSigner = await browserProvider.getSigner();
      const activeAccount = accounts[0];

      setAccount(activeAccount);
      setChainId(currentChainId);
      setProvider(browserProvider);
      setSigner(activeSigner);

      const isTarget = currentChainId === TARGET_CHAIN_ID;
      setIsCorrectNetwork(isTarget);

      await updateBalance(activeAccount, browserProvider);
      await detectUserRole(activeAccount, browserProvider);

      return true;
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (err.code === 4001) {
        setError('Wallet connection was cancelled by user.');
      } else {
        setError(err.message || 'Failed to connect wallet.');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setBalance('0');
    setProvider(null);
    setSigner(null);
    setUserRole('guest');
    setCharityData(null);
    setIsCharityVerified(false);
    setError(null);
  };

  // Listen to MetaMask account & chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        if (provider) {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
          await updateBalance(newAccount, provider);
          await detectUserRole(newAccount, provider);
        }
      }
    };

    const handleChainChanged = (newChainHex) => {
      const newChain = parseInt(newChainHex, 16);
      setChainId(newChain);
      setIsCorrectNetwork(newChain === TARGET_CHAIN_ID);
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Auto-check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then(async (accounts) => {
      if (accounts && accounts.length > 0) {
        try {
          const browserProvider = new BrowserProvider(window.ethereum);
          const network = await browserProvider.getNetwork();
          const currentChainId = Number(network.chainId);
          const currentSigner = await browserProvider.getSigner();

          setAccount(accounts[0]);
          setChainId(currentChainId);
          setProvider(browserProvider);
          setSigner(currentSigner);
          setIsCorrectNetwork(currentChainId === TARGET_CHAIN_ID);

          await updateBalance(accounts[0], browserProvider);
          await detectUserRole(accounts[0], browserProvider);
        } catch (err) {
          console.warn('Auto-connection check failed:', err);
        }
      }
    });

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [provider, updateBalance, detectUserRole]);

  const activeProvider = provider || readProvider;

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        balance,
        isConnecting,
        isCorrectNetwork,
        provider,
        signer,
        readProvider,
        activeProvider,
        error,
        userRole,
        charityData,
        isCharityVerified,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshRole: () => detectUserRole(account, activeProvider),
        refreshBalance: () => updateBalance(account, activeProvider),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
