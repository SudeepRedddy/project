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
  if (!provider || !contract || !(provider instanceof ethers.BrowserProvider)) {
    throw new Error('MetaMask is not connected. Please connect your wallet.');
  }
  try {
    const signer = await provider.getSigner();
    const contractWithSigner = contract.connect(signer) as ethers.Contract;
    const tx = await contractWithSigner.issueCertificate(certificateId, studentId, studentName, course, university);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error('Error issuing certificate:', error);
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