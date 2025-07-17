import React, { useEffect, useState } from 'react';
import { Wallet, WalletCards, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const WalletConnect: React.FC = () => {
  const { 
    wallet, 
    isMetaMaskAvailable,
    isPolkadotAvailable,
    connectMetaMask, 
    connectPolkadot,
    disconnectWallet 
  } = useWallet();

  const [justConnected, setJustConnected] = useState(false);

  // Show "just connected" feedback briefly
  useEffect(() => {
    if (wallet.isConnected) {
      setJustConnected(true);
      const timer = setTimeout(() => setJustConnected(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [wallet.account, wallet.walletType]);

  const getWalletTypeDisplay = (walletType: string | null) => {
    switch (walletType) {
      case 'metamask':
        return '🦊 MetaMask';
      case 'polkadot':
        return '🔴 Polkadot.js';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="wallet-connect">
      <div className={`card ${justConnected ? 'wallet-just-connected' : ''}`}>
        <div className="card-header">
          <h2 className="card-title">
            <Wallet className="icon" />
            Wallet Connection
          </h2>
        </div>
        
        <div className="card-content">
          {!wallet.isConnected ? (
            <div className="not-connected">
              <WalletCards className="wallet-icon" />
              <p className="description">
                Connect your wallet to start using Sign In With Frequency
              </p>
              
              {wallet.error && (
                <div className="error-message">
                  <AlertCircle className="icon" />
                  {wallet.error}
                </div>
              )}

              <div className="wallet-options">
                <h3>Choose a Wallet:</h3>
                
                {/* MetaMask Option */}
                <div className="wallet-option">
                  <button 
                    onClick={connectMetaMask} 
                    disabled={wallet.isConnecting || !isMetaMaskAvailable}
                    className={`btn ${isMetaMaskAvailable ? 'btn-primary' : 'btn-disabled'}`}
                  >
                    {wallet.isConnecting ? (
                      <>
                        <Loader className="icon spinning" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        🦊 Connect MetaMask
                      </>
                    )}
                  </button>
                  {!isMetaMaskAvailable && (
                    <p className="wallet-note">
                      MetaMask not detected. <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">Install MetaMask</a>
                    </p>
                  )}
                </div>

                {/* Polkadot.js Option */}
                <div className="wallet-option">
                  <button 
                    onClick={connectPolkadot} 
                    disabled={wallet.isConnecting}
                    className="btn btn-primary"
                  >
                    {wallet.isConnecting ? (
                      <>
                        <Loader className="icon spinning" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        🔴 Connect Polkadot.js
                      </>
                    )}
                  </button>
                  <p className="wallet-note">
                    Don't have Polkadot.js? <a href="https://polkadot.js.org/extension/" target="_blank" rel="noopener noreferrer">Install Extension</a>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="connected">
              <div className="wallet-info">
                <div className="status">
                  <div className="status-indicator connected"></div>
                  <span>Connected via {getWalletTypeDisplay(wallet.walletType)}</span>
                  {justConnected && <CheckCircle className="icon success-flash" />}
                </div>
                <div className="address">
                  <strong>Address:</strong> {wallet.account?.slice(0, 8)}...{wallet.account?.slice(-6)}
                </div>
              </div>
              <button 
                onClick={disconnectWallet}
                className="btn btn-secondary"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 