import React, { useState, useEffect, useRef } from 'react';
import { Key, User, Mail, Loader, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { SiwfRequestGenerator } from './SiwfRequestGenerator';
import type { SiwfResult, SiwfState } from '../types';

export const SiwfLogin: React.FC = () => {
  const { wallet } = useWallet();
  const [siwfState, setSiwfState] = useState<SiwfState>({
    isLoading: false,
    result: null,
    error: null
  });
  const [isResetting, setIsResetting] = useState(false);
  const [componentKey, setComponentKey] = useState(0);
  
  // Track previous wallet state to detect changes
  const prevWalletRef = useRef<{
    account: string | null;
    walletType: string | null;
    isConnected: boolean;
  }>({
    account: null,
    walletType: null,
    isConnected: false
  });

  // Force component re-render by incrementing key
  const forceRerender = () => {
    setComponentKey(prev => prev + 1);
    console.log('🔄 Forcing component re-render, new key:', componentKey + 1);
  };

  // Reset component state when wallet changes
  useEffect(() => {
    const currentWallet = {
      account: wallet.account,
      walletType: wallet.walletType,
      isConnected: wallet.isConnected
    };

    const previousWallet = prevWalletRef.current;
    
    const walletChanged = 
      currentWallet.account !== previousWallet.account ||
      currentWallet.walletType !== previousWallet.walletType ||
      currentWallet.isConnected !== previousWallet.isConnected;

    if (walletChanged) {
      console.log('🔄 SiwfLogin: Wallet state CHANGED:', {
        previous: previousWallet,
        current: currentWallet,
        timestamp: new Date().toISOString()
      });

      setIsResetting(true);
      setSiwfState({
        isLoading: false,
        result: null,
        error: null
      });
      
      forceRerender();
      prevWalletRef.current = currentWallet;
    }
  }, [wallet.account, wallet.walletType, wallet.isConnected]);

  // Separate effect to handle reset animation timeout
  useEffect(() => {
    if (isResetting) {
      console.log('🔄 Starting reset animation...');
      
      const timer = setTimeout(() => {
        console.log('🔄 Clearing reset animation (primary)');
        setIsResetting(false);
      }, 800);
      
      const safetyTimer = setTimeout(() => {
        console.log('🔄 SAFETY: Force clearing reset animation');
        setIsResetting(false);
      }, 3000);
      
      return () => {
        console.log('🔄 Cleanup: clearing reset timers');
        clearTimeout(timer);
        clearTimeout(safetyTimer);
      };
    }
  }, [isResetting]);

  // Additional effect to reset on mount
  useEffect(() => {
    console.log('🔄 SiwfLogin: Component mounted/remounted');
    setSiwfState({
      isLoading: false,
      result: null,
      error: null
    });
  }, []);

  const handleStartAuthentication = (signedRequest: string) => {
    console.log('🚀 Starting SIWF authentication with signed request');
    setSiwfState({
      isLoading: true,
      result: null,
      error: null
    });

    try {
      // Build the testnet URL and redirect
      const testnetUrl = `https://testnet.frequencyaccess.com/siwa/start?signedRequest=${signedRequest}`;
      console.log('🔗 Redirecting to:', testnetUrl);
      
      toast.success('Redirecting to SIWF authentication...');
      
      // In a real app, you might want to save state before redirecting
      window.location.href = testnetUrl;
      
    } catch (error: any) {
      console.error('❌ Failed to start authentication:', error);
      setSiwfState({
        isLoading: false,
        result: null,
        error: error.message || 'Failed to start authentication'
      });
      toast.error(error.message || 'Failed to start authentication');
    }
  };

  const getWalletDisplayName = () => {
    switch (wallet.walletType) {
      case 'metamask':
        return '🦊 MetaMask';
      case 'polkadot':
        return '🔴 Polkadot.js';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="siwf-login">
      <div className={`card ${isResetting ? 'component-resetting' : ''}`}>
        <div className="card-header">
          <h2 className="card-title">
            <Key className="icon" />
            Sign In With Frequency
            {isResetting && <RefreshCw className="icon spinning reset-indicator" />}
            <span className="debug-key" title={`Component Key: ${componentKey}`}>#{componentKey}</span>
          </h2>
          <p className="card-description">
            Generate and use SIWF authentication requests
          </p>
        </div>

        <div className="card-content">
          {!wallet.isConnected ? (
            <div className="not-connected">
              <AlertTriangle className="icon" />
              <p className="warning">Connect your wallet to see connected account info</p>
              <p className="info">You can still generate SIWF requests without a connected wallet.</p>
            </div>
          ) : (
            <div className="wallet-info-section">
              <h3>Connected Wallet</h3>
              <div className="wallet-display">
                <div className="wallet-type">
                  <strong>Type:</strong> {getWalletDisplayName()}
                </div>
                <div className="wallet-address">
                  <strong>Address:</strong> {wallet.account?.slice(0, 8)}...{wallet.account?.slice(-6)}
                </div>
              </div>
            </div>
          )}

          {siwfState.error && (
            <div className="error-section">
              <div className="error-message">
                <XCircle className="icon" />
                {siwfState.error}
              </div>
            </div>
          )}

          {siwfState.isLoading ? (
            <div className="loading-section">
              <Loader className="icon spinning" />
              <p>Redirecting to SIWF authentication...</p>
            </div>
          ) : (
            <SiwfRequestGenerator 
              onStartAuthentication={handleStartAuthentication}
              walletInfo={wallet.isConnected && wallet.account && wallet.walletType ? {
                account: wallet.account,
                walletType: wallet.walletType
              } : undefined}
            />
          )}

          {/* Emergency reset button for debugging */}
          {isResetting && (
            <button
              onClick={() => {
                console.log('🔄 Manual reset triggered');
                setIsResetting(false);
              }}
              className="btn btn-secondary"
              style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
            >
              Force Reset (Debug)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 