import { useState, useCallback } from 'react';
import { encryptFile } from '../utils/crypto';

interface UseIPFSState {
  loading: boolean;
  progress: number;
  error: string | null;
}

export const useIPFS = () => {
  const [state, setState] = useState<UseIPFSState>({
    loading: false,
    progress: 0,
    error: null,
  });

  const upload = useCallback(
    async (
      file: File,
      walletAddress: string
    ): Promise<{ ipfsHash: string; iv: string; salt: string }> => {
      setState({ loading: true, progress: 0, error: null });

      try {
        // Encrypt file
        setState((prev) => ({ ...prev, progress: 30 }));
        const { encryptedBlob, iv, salt } = await encryptFile(file, walletAddress);

        // Upload to Pinata
        const formData = new FormData();
        formData.append('file', encryptedBlob, `encrypted_${file.name}`);

        setState((prev) => ({ ...prev, progress: 50 }));

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Pinata upload failed');

        setState((prev) => ({ ...prev, progress: 80 }));

        const data = await response.json();
        const ipfsHash = data.IpfsHash;

        setState({ loading: false, progress: 100, error: null });

        return { ipfsHash, iv, salt };
      } catch (err: any) {
        const errorMessage = err.message || 'IPFS upload failed';
        setState({ loading: false, progress: 0, error: errorMessage });
        throw err;
      }
    },
    []
  );

  return { ...state, upload };
};
