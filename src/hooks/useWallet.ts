import { useState, useEffect } from 'react';
import * as freighter from '@stellar/freighter-api';
import { getAccountBalance } from '../utils/stellar';
import posthog from 'posthog-js';

interface WalletState {
  address: string | null;
  balance: string;
  connected: boolean;
  role: 'patient' | 'doctor' | null;
  loading: boolean;
  error: string | null;
  freighterInstalled: boolean;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: '0',
    connected: false,
    role: null,
    loading: false,
    error: null,
    freighterInstalled: false,
  });

  // On mount: check Freighter and restore session
  useEffect(() => {
    const initWallet = async () => {
      try {
        const isConnected = await freighter.isConnected();
        if (!isConnected.isConnected) {
          setState((prev) => ({ ...prev, freighterInstalled: false }));
          return;
        }

        setState((prev) => ({ ...prev, freighterInstalled: true }));

        const isAllowed = await freighter.isAllowed();
        if (isAllowed.isAllowed) {
          const stored = sessionStorage.getItem('cv_wallet');
          if (stored) {
            const { address, role } = JSON.parse(stored);
            const balance = await getAccountBalance(address);
            setState((prev) => ({
              ...prev,
              address,
              role,
              balance,
              connected: true,
            }));
          }
        }
      } catch (err) {
        console.error('Wallet init error:', err);
      }
    };

    initWallet();
  }, []);

  const connect = async (role: 'patient' | 'doctor') => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const accessResult = await freighter.requestAccess();
      if (accessResult.error?.message?.includes('User declined')) {
        throw new Error('Connection rejected. Please approve in Freighter.');
      }

      const addressResult = await freighter.getAddress();
      if (addressResult.error) throw new Error(addressResult.error.message);

      const address = addressResult.address;
      const balance = await getAccountBalance(address);

      sessionStorage.setItem('cv_wallet', JSON.stringify({ address, role }));

      posthog.capture('wallet_connected', {
        role,
        network: import.meta.env.VITE_STELLAR_NETWORK,
      });

      setState((prev) => ({
        ...prev,
        address,
        role,
        balance,
        connected: true,
        loading: false,
        error: null,
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';
      setState((prev) => ({ ...prev, error: errorMsg, loading: false }));
    }
  };

  const disconnect = () => {
    sessionStorage.removeItem('cv_wallet');
    setState({
      address: null,
      balance: '0',
      connected: false,
      role: null,
      loading: false,
      error: null,
      freighterInstalled: state.freighterInstalled,
    });
  };

  return { ...state, connect, disconnect };
};
