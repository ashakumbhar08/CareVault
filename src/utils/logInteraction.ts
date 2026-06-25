import { supabase } from './supabase';

interface LogInteractionParams {
  walletAddress: string;
  action: string;
  txHash?: string;
  explorerUrl?: string;
  network: string;
}

export async function logInteraction(params: LogInteractionParams) {
  try {
    const truncated = `${params.walletAddress.slice(0, 4)}...${params.walletAddress.slice(-4)}`;

    await supabase.from('interactions').insert([
      {
        wallet_address: truncated,
        action: params.action,
        tx_hash: params.txHash || null,
        stellar_explorer_url: params.explorerUrl || null,
        network: params.network,
      },
    ]);
  } catch (err) {
    // Silently swallow logging errors to never block user flow
    console.error('Interaction logging failed:', err);
  }
}
