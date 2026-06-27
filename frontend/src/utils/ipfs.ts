import axios from 'axios';

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

const isDemoMode = () => new URLSearchParams(window.location.search).get('demo') === 'true';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export const uploadToIPFS = async (
  encryptedBlob: Blob,
  fileName: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> => {
  if (isDemoMode() || !PINATA_JWT) {
    // Return mock IPFS hash
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  const formData = new FormData();
  formData.append('file', encryptedBlob, fileName);

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues: {
      encrypted: 'true',
      uploadedAt: new Date().toISOString(),
    },
  });
  formData.append('pinataMetadata', metadata);

  const response = await axios.post(PINATA_API_URL, formData, {
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage,
        });
      }
    },
  });

  return response.data.IpfsHash;
};

export const getIPFSUrl = (ipfsHash: string): string => {
  return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
};

export const downloadFromIPFS = async (ipfsHash: string): Promise<Blob> => {
  if (isDemoMode()) {
    // Return mock encrypted blob
    const mockData = new Uint8Array(1024);
    crypto.getRandomValues(mockData);
    return new Blob([mockData]);
  }

  const url = getIPFSUrl(ipfsHash);
  const response = await axios.get(url, {
    responseType: 'blob',
  });

  return response.data;
};
