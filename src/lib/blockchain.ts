import { ethers } from 'ethers';

// ABI for the Certificate smart contract
const certificateContractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "certificateId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "studentId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "course",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "university",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "certificates",
    "outputs": [
      {
        "internalType": "string",
        "name": "certificateId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "studentId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "course",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "university",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "issuer",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certificateId",
        "type": "string"
      }
    ],
    "name": "getCertificate",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "certificateId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "studentId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "studentName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "course",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "university",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "issuer",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "internalType": "struct CertificateContract.Certificate",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certificateId",
        "type": "string"
      }
    ],
    "name": "isCertificateValid",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "certificateId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "studentId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "course",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "university",
        "type": "string"
      }
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = '0xD2afa4f1a7D4Bd0b8Aff8496dDFa5332DA423ee2';
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
const SEPOLIA_NETWORK_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia test network',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

const PUBLIC_RPC_ENDPOINTS = [
  'https://eth-sepolia.public.blastapi.io',
  'https://rpc.sepolia.org',
  'https://rpc2.sepolia.org',
  'https://sepolia.gateway.tenderly.co'
];

let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
let contract: ethers.Contract | null = null;
let web3Initialized = false;

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Check if user is on Sepolia network
export const isOnSepoliaNetwork = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId === SEPOLIA_CHAIN_ID;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

// Switch to Sepolia network
export const switchToSepoliaNetwork = async (): Promise<boolean> => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SEPOLIA_NETWORK_CONFIG],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sepolia network:', addError);
        throw new Error('Failed to add Sepolia network to MetaMask');
      }
    } else {
      console.error('Error switching to Sepolia:', switchError);
      throw new Error('Failed to switch to Sepolia network');
    }
  }
};

const initFallbackProvider = async (): Promise<boolean> => {
  if (provider) return true;
  
  for (const rpcUrl of PUBLIC_RPC_ENDPOINTS) {
    try {
      const fallbackProvider = new ethers.JsonRpcProvider(rpcUrl);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      await Promise.race([
        fallbackProvider.getBlockNumber(),
        timeoutPromise
      ]);
      
      provider = fallbackProvider;
      contract = new ethers.Contract(CONTRACT_ADDRESS, certificateContractABI, provider);
      return true;
    } catch (err) {
      console.warn(`Failed to connect to ${rpcUrl}`);
    }
  }
  
  return false;
};

export const initWeb3 = async (): Promise<boolean> => {
  if (web3Initialized && provider) return true;
  
  try {
    const success = await initFallbackProvider();
    web3Initialized = true;
    return success;
  } catch (error) {
    console.error('Web3 initialization failed:', error);
    web3Initialized = true;
    return false;
  }
};

export const connectWallet = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  try {
    // First, ensure we're on the correct network
    const isOnSepolia = await isOnSepoliaNetwork();
    if (!isOnSepolia) {
      await switchToSepoliaNetwork();
    }

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await browserProvider.send("eth_requestAccounts", []);
    const signer = await browserProvider.getSigner();
    
    provider = browserProvider;
    contract = new ethers.Contract(CONTRACT_ADDRESS, certificateContractABI, signer);
    
    return accounts[0] || null;
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw error;
  }
};

export const isWeb3Initialized = (): boolean => {
  return web3Initialized;
};

export const getCurrentAccount = async (): Promise<string | null> => {
  if (!provider || !(provider instanceof ethers.BrowserProvider)) return null;
  try {
    const accounts = await provider.listAccounts();
    return accounts[0]?.address || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

export const issueCertificateOnBlockchain = async (
  certificateId: string,
  studentId: string,
  studentName: string,
  course: string,
  university: string
): Promise<any> => {
  // Ensure MetaMask is connected and on the right network
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed.');
  }

  // Check if we're on Sepolia network
  const isOnSepolia = await isOnSepoliaNetwork();
  if (!isOnSepolia) {
    throw new Error('Please switch to Sepolia testnet in MetaMask.');
  }

  // Ensure wallet is connected
  if (!provider || !contract || !(provider instanceof ethers.BrowserProvider)) {
    // Try to connect wallet first
    await connectWallet();
    if (!provider || !contract) {
      throw new Error('Failed to connect to MetaMask. Please try again.');
    }
  }

  try {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer) as ethers.Contract;
    
    // Estimate gas first to catch any errors early
    const gasEstimate = await contractWithSigner.issueCertificate.estimateGas(
      certificateId, 
      studentId, 
      studentName, 
      course, 
      university
    );
    
    const tx = await contractWithSigner.issueCertificate(
      certificateId, 
      studentId, 
      studentName, 
      course, 
      university,
      {
        gasLimit: Math.floor(Number(gasEstimate) * 1.2) // Add 20% buffer
      }
    );
    
    const receipt = await tx.wait();
    return receipt;
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    
    // Handle specific error cases
    if (error.code === 4001) {
      throw new Error('Transaction was rejected by user.');
    } else if (error.code === -32603 && error.message.includes('insufficient funds')) {
      throw new Error('Insufficient ETH balance for gas fees. Please add Sepolia ETH to your wallet.');
    } else if (error.message.includes('Certificate with this ID already exists')) {
      throw new Error('Certificate with this ID already exists on the blockchain.');
    }
    
    throw error;
  }
};

// Batch certificate issuance to save gas fees
export const issueBatchCertificatesOnBlockchain = async (
  certificates: Array<{
    certificateId: string;
    studentId: string;
    studentName: string;
    course: string;
    university: string;
  }>
): Promise<any> => {
  // Ensure MetaMask is connected and on the right network
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed.');
  }

  // Check if we're on Sepolia network
  const isOnSepolia = await isOnSepoliaNetwork();
  if (!isOnSepolia) {
    throw new Error('Please switch to Sepolia testnet in MetaMask.');
  }

  // Ensure wallet is connected
  if (!provider || !contract || !(provider instanceof ethers.BrowserProvider)) {
    await connectWallet();
    if (!provider || !contract) {
      throw new Error('Failed to connect to MetaMask. Please try again.');
    }
  }

  try {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer) as ethers.Contract;
    
    // For batch operations, we'll issue certificates one by one in a single transaction
    // This is a simplified approach - in production, you'd want a proper batch contract method
    const results = [];
    
    for (const cert of certificates) {
      try {
        const gasEstimate = await contractWithSigner.issueCertificate.estimateGas(
          cert.certificateId,
          cert.studentId,
          cert.studentName,
          cert.course,
          cert.university
        );
        
        const tx = await contractWithSigner.issueCertificate(
          cert.certificateId,
          cert.studentId,
          cert.studentName,
          cert.course,
          cert.university,
          {
            gasLimit: Math.floor(Number(gasEstimate) * 1.2)
          }
        );
        
        const receipt = await tx.wait();
        results.push({ certificateId: cert.certificateId, success: true, receipt });
      } catch (error) {
        console.error(`Failed to issue certificate ${cert.certificateId}:`, error);
        results.push({ certificateId: cert.certificateId, success: false, error });
      }
    }
    
    return results;
  } catch (error: any) {
    console.error('Error issuing batch certificates:', error);
    throw error;
  }
};

export const verifyCertificateOnBlockchain = async (certificateId: string): Promise<any> => {
  if (!contract) {
    await initWeb3();
    if (!contract) throw new Error('Failed to initialize Web3 for verification.');
  }
  try {
    const certificateData = await contract.certificates(certificateId);
    if (!certificateData || !certificateData.exists) return null;
    return {
      certificateId: certificateData.certificateId,
      studentId: certificateData.studentId,
      studentName: certificateData.studentName,
      course: certificateData.course,
      university: certificateData.university,
      timestamp: certificateData.timestamp,
      issuer: certificateData.issuer,
      exists: certificateData.exists
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

export const isValidCertificateId = (certificateId: string): boolean => {
  const certIdRegex = /^[0-9A-F]{8}$/;
  return certIdRegex.test(certificateId);
};

export const generateCertificateId = (
    studentId: string,
    studentName: string,
    course: string,
    university: string,
): string => {
    const payload = {
        studentId: studentId.trim(),
        studentName: studentName.trim(),
        course: course.trim(),
        university: university.trim(),
        timestamp: Date.now(),
        nonce: Math.floor(Math.random() * 1000000)
    };
    const payloadBytes = ethers.toUtf8Bytes(JSON.stringify(payload));
    const hash = ethers.keccak256(payloadBytes);
    return `${hash.substring(2, 10)}`.toUpperCase();
};

declare global {
  interface Window {
    ethereum?: any;
  }
}