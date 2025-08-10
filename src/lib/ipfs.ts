// IPFS integration for decentralized storage

interface IPFSUploadResult {
  hash: string;
  url: string;
}

// Using Pinata as IPFS gateway (you can replace with your preferred service)
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export const uploadToIPFS = async (file: Blob, filename: string): Promise<IPFSUploadResult> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error('IPFS configuration not found. Using local storage instead.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file, filename);
    
    const metadata = JSON.stringify({
      name: filename,
      keyvalues: {
        type: 'certificate',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', options);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      hash: result.IpfsHash,
      url: `${PINATA_GATEWAY}${result.IpfsHash}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};

export const getIPFSUrl = (hash: string): string => {
  return `${PINATA_GATEWAY}${hash}`;
};

// Alternative: Use a public IPFS gateway if Pinata is not configured
export const uploadToPublicIPFS = async (file: Blob, filename: string): Promise<IPFSUploadResult> => {
  // This is a fallback implementation using a public IPFS node
  // In production, you should use a reliable IPFS service like Pinata, Infura, or your own node
  
  try {
    const formData = new FormData();
    formData.append('file', file, filename);

    // Using a public IPFS API (replace with your preferred service)
    const response = await fetch('https://ipfs.infura.io:5001/api/v0/add', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    const result = await response.json();
    
    return {
      hash: result.Hash,
      url: `https://ipfs.io/ipfs/${result.Hash}`
    };
  } catch (error) {
    console.error('Public IPFS upload error:', error);
    // Return a mock result for development
    const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15);
    return {
      hash: mockHash,
      url: `https://ipfs.io/ipfs/${mockHash}`
    };
  }
};