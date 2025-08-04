import React from 'react';
import { ExternalLink, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';

const MetaMaskGuide = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Wallet className="h-6 w-6 text-orange-500 mr-2" />
        <h2 className="text-lg font-semibold">How to Connect with MetaMask</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-orange-100 rounded-full p-1 mt-0.5">
            <span className="text-orange-600 font-bold text-sm">1</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Install MetaMask</h3>
            <p className="text-sm text-gray-600">
              If you don't have MetaMask installed, download and install it from the{' '}
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                official website <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-orange-100 rounded-full p-1 mt-0.5">
            <span className="text-orange-600 font-bold text-sm">2</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Create or Import a Wallet</h3>
            <p className="text-sm text-gray-600">
              Follow the instructions in MetaMask to create a new wallet or import an existing one
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-orange-100 rounded-full p-1 mt-0.5">
            <span className="text-orange-600 font-bold text-sm">3</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Connect to Sepolia Test Network</h3>
            <p className="text-sm text-gray-600">
              Our application uses the Sepolia test network. When you click "Connect Wallet", 
              MetaMask will automatically prompt you to switch to or add the Sepolia network.
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-orange-100 rounded-full p-1 mt-0.5">
            <span className="text-orange-600 font-bold text-sm">4</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Get Test ETH (Optional)</h3>
            <p className="text-sm text-gray-600">
              To issue certificates on the blockchain, you'll need some test ETH. Get it from the{' '}
              <a 
                href="https://sepoliafaucet.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                Sepolia Faucet <ExternalLink className="h-3 w-3 ml-0.5" />
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            <span className="font-medium">Note:</span> Without MetaMask, you can still use the application in read-only mode, 
            but you won't be able to issue certificates on the blockchain.
          </p>
        </div>
        
        <div className="flex items-start mt-3">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            <span className="font-medium">Tip:</span> After connecting, your wallet address will appear in the Blockchain Status section, 
            indicating you're ready to issue blockchain-verified certificates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskGuide;