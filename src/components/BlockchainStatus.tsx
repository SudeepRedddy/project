import React, { useEffect, useState, useCallback } from 'react';
import { Shield, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { initWeb3, getCurrentAccount, isMetaMaskInstalled, connectWallet } from '../lib/blockchain';

const BlockchainStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [hasMetaMask, setHasMetaMask] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const updateStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Updating blockchain status...');
      const initialized = await initWeb3();
      if (initialized) {
        setIsConnected(true);
        const currentAccount = await getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          setIsReadOnly(false);
          console.log('Blockchain connected with wallet:', currentAccount);
        } else {
          setAccount(null);
          setIsReadOnly(true);
          console.log('Blockchain connected in read-only mode');
        }
      } else {
        setIsConnected(false);
        setError("Could not connect to blockchain network");
        console.log('Blockchain connection failed');
      }
    } catch (error) {
      console.error('Error updating blockchain status:', error);
      setIsConnected(false);
      setError("Blockchain connection error");
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    setHasMetaMask(isMetaMaskInstalled());
    updateStatus();

    const handleAccountsChanged = (accounts: string[]) => {
      updateStatus();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, [updateStatus]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      await connectWallet();
      await updateStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className={`h-6 w-6 ${isConnected ? (isReadOnly ? 'text-yellow-500' : 'text-green-600') : 'text-gray-400'} mr-3`} />
          <div>
            <h3 className="font-medium">Blockchain Status</h3>
            {isLoading ? (
              <p className="text-sm text-gray-500">Checking connection...</p>
            ) : isConnected ? (
              <div>
                {isReadOnly ? (
                  <p className="text-sm text-yellow-600">Connected in read-only mode</p>
                ) : (
                  <p className="text-sm text-green-600">Connected to wallet</p>
                )}
                {account && (
                  <p className="text-xs text-gray-500 mt-1">
                    Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-500">Not connected</p>
            )}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>
        
        {!isLoading && isReadOnly && (
          <div>
            {hasMetaMask ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1 text-sm bg-orange-500 text-white rounded"
              >
                Install MetaMask <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainStatus;