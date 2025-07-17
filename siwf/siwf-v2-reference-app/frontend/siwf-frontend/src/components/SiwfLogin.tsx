import React, { useState, useEffect, useRef } from 'react';
import { Key, User, Mail, Loader, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '../hooks/useWallet';
import { siwfLogin, createSignatureFn } from '../utils/siwf';
import type { SiwfResult, SiwfState } from '../types';

export const SiwfLogin: React.FC = () => {
  const { wallet, signTypedData, signMessage } = useWallet();
  const [siwfState, setSiwfState] = useState<SiwfState>({
    isLoading: false,
    result: null,
    error: null
  });
  const [userHandle, setUserHandle] = useState('coolUser123');
  const [email, setEmail] = useState('user@example.com');
  const [msaInfo, setMsaInfo] = useState<any>(null);
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
    
    // Check if wallet actually changed
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

      // Show reset animation
      setIsResetting(true);
      
      // Clear SIWF results when wallet disconnects or changes account
      setSiwfState({
        isLoading: false,
        result: null,
        error: null
      });
      setMsaInfo(null);
      
      // Reset form inputs to defaults when wallet disconnects
      if (!currentWallet.isConnected) {
        console.log('🔄 Wallet disconnected - resetting form to defaults');
        setUserHandle('coolUser123');
        setEmail('user@example.com');
      } else {
        console.log('🔄 Wallet changed - clearing previous SIWF state');
      }

      // Force component re-render
      forceRerender();
      
      // Update previous wallet state
      prevWalletRef.current = currentWallet;
    } else {
      console.log('🔄 SiwfLogin: Wallet state unchanged');
    }
  }, [wallet.account, wallet.walletType, wallet.isConnected]);

  // Separate effect to handle reset animation timeout
  useEffect(() => {
    if (isResetting) {
      console.log('🔄 Starting reset animation...');
      
      // Primary timer
      const timer = setTimeout(() => {
        console.log('🔄 Clearing reset animation (primary)');
        setIsResetting(false);
      }, 800);
      
      // Safety timer - force clear after 3 seconds
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
    setMsaInfo(null);
  }, []);

  const handleSiwfLogin = async () => {
    if (!wallet.isConnected || !wallet.account || !wallet.walletType) {
      toast.error('Please connect your wallet first');
      return;
    }

    setSiwfState({
      isLoading: true,
      result: null,
      error: null
    });
    setMsaInfo(null);

    try {
      // Create signature function for wallet integration
      const signatureFn = createSignatureFn(
        signTypedData, 
        signMessage, 
        wallet.walletType, 
        wallet.account
      );

      // Handle MSA creation callback
      const onMsaCreated = (account: any) => {
        console.log('MSA callback received:', account);
        setMsaInfo(account);
        toast.success(`MSA created/found: ${account.msaId}`);
      };

      console.log('🚀 Starting SIWF login with:', {
        accountId: wallet.account,
        walletType: wallet.walletType,
        userHandle,
        email
      });

      const response = await siwfLogin(
        {
          handle: userHandle.trim() || 'defaultHandle',
          email: email.trim() || 'default@example.com',
        },
        signatureFn,
        onMsaCreated,
        wallet.account,
        wallet.walletType
      );

      setSiwfState({
        isLoading: false,
        result: response,
        error: null
      });
      
      toast.success('SIWF login completed successfully!');

    } catch (error: any) {
      console.error('SIWF login failed:', error);
      setSiwfState({
        isLoading: false,
        result: null,
        error: error.message || 'SIWF login failed'
      });
      toast.error(error.message || 'SIWF login failed');
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
            Authenticate and create/access your decentralized identity
          </p>
        </div>

        <div className="card-content">
          {!wallet.isConnected ? (
            <div className="not-connected">
              <AlertTriangle className="icon" />
              <p className="warning">Please connect your wallet first to use SIWF</p>
            </div>
          ) : (
            <div className={`siwf-content ${isResetting ? 'content-resetting' : ''}`}>
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

              <div className="form-section">
                <h3>User Information</h3>
                <p className="form-description">
                  For new users: provide handle and email. Existing users: these fields are optional.
                </p>
                
                <div className="form-group">
                  <label htmlFor="userHandle">
                    <User className="icon" />
                    User Handle
                  </label>
                  <input
                    id="userHandle"
                    type="text"
                    value={userHandle}
                    onChange={(e) => setUserHandle(e.target.value)}
                    placeholder="Enter your desired handle"
                    className="form-input"
                    key={`handle-${componentKey}-${wallet.account}`} // Force input reset on wallet change
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <Mail className="icon" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="form-input"
                    key={`email-${componentKey}-${wallet.account}`} // Force input reset on wallet change
                  />
                </div>

                <button
                  onClick={handleSiwfLogin}
                  disabled={siwfState.isLoading || isResetting}
                  className="btn btn-primary btn-large"
                >
                  {siwfState.isLoading ? (
                    <>
                      <Loader className="icon spinning" />
                      Processing SIWF...
                    </>
                  ) : isResetting ? (
                    <>
                      <RefreshCw className="icon spinning" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Key className="icon" />
                      Start SIWF Login
                    </>
                  )}
                </button>
                
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

              {siwfState.error && (
                <div className="error-section">
                  <div className="error-message">
                    <XCircle className="icon" />
                    {siwfState.error}
                  </div>
                </div>
              )}

              {(siwfState.result || msaInfo) && (
                <div className="results-section">
                  <h3>Results</h3>
                  
                  {msaInfo && (
                    <div className="result-card success">
                      <div className="result-header">
                        <CheckCircle className="icon" />
                        <h4>MSA Information</h4>
                      </div>
                      <div className="result-content">
                        <div className="result-item">
                          <strong>MSA ID:</strong> {msaInfo.msaId}
                        </div>
                        {msaInfo.handle && (
                          <div className="result-item">
                            <strong>Handle:</strong> {msaInfo.handle}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {siwfState.result && (
                    <div className="result-card">
                      <div className="result-header">
                        <CheckCircle className="icon" />
                        <h4>SIWF Response</h4>
                        {siwfState.result.isNewUser ? (
                          <span className="badge signup">New User Signup</span>
                        ) : (
                          <span className="badge login">Existing User Login</span>
                        )}
                      </div>
                      <div className="result-content">
                        <div className="result-item">
                          <strong>Account ID:</strong> 
                          <code>{siwfState.result.accountId?.slice(0, 20)}...</code>
                        </div>
                        {siwfState.result.msaId && (
                          <div className="result-item">
                            <strong>MSA ID:</strong> {siwfState.result.msaId}
                          </div>
                        )}
                        <div className="result-item">
                          <strong>Handle:</strong> {siwfState.result.handle}
                        </div>
                        <div className="result-item">
                          <strong>Credentials:</strong> {siwfState.result.credentials?.length || 0} items
                        </div>
                        <div className="result-item">
                          <strong>User Type:</strong> {siwfState.result.isNewUser ? 'New Registration' : 'Existing User'}
                        </div>
                        <div className="result-item">
                          <strong>Wallet Type:</strong> {getWalletDisplayName()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 