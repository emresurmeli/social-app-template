import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { WalletConnect } from './components/WalletConnect';
import { SiwfLogin } from './components/SiwfLogin';
import { useWallet } from './hooks/useWallet';
import { initializeSiwfCallback } from './utils/siwf';
import './App.css';

function App() {
  const { wallet } = useWallet();
  const [rerenderCounter, setRerenderCounter] = useState(0);
  
  // Create a unique key based on wallet state to force re-rendering on wallet changes
  const walletKey = `${wallet.walletType || 'none'}-${wallet.account || 'none'}-${wallet.isConnected}-${rerenderCounter}`;

  // Initialize SIWF callback handling on mount
  useEffect(() => {
    initializeSiwfCallback(
      (result) => {
        console.log('✅ SIWF authentication successful:', result);
        toast.success('SIWF authentication completed!');
        // Handle the successful authentication result
        // You can store the result in state or redirect to another page
      },
      (error) => {
        console.error('❌ SIWF authentication failed:', error);
        toast.error('SIWF authentication failed: ' + error.message);
      }
    );
  }, []);

  // Force re-render when wallet state changes
  useEffect(() => {
    console.log('🔄 App: Wallet state changed, forcing component re-render', {
      walletType: wallet.walletType,
      account: wallet.account?.slice(0, 8) + '...',
      isConnected: wallet.isConnected,
      newKey: walletKey
    });
    
    setRerenderCounter(prev => prev + 1);
  }, [wallet.account, wallet.walletType, wallet.isConnected]);

  return (
    <div className="app">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            🔑 SIWF Frontend Demo
          </h1>
          <p className="app-subtitle">
            Test Sign In With Frequency integration with MetaMask and Polkadot.js wallets
          </p>
          <small className="debug-info">
            Render: #{rerenderCounter} | Wallet: {wallet.walletType || 'none'} | Connected: {wallet.isConnected ? '✅' : '❌'}
          </small>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="grid">
            <div className="grid-item">
              <WalletConnect key={`wallet-connect-${walletKey}`} />
            </div>
            <div className="grid-item">
              <SiwfLogin key={`siwf-login-${walletKey}`} />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p className="footer-text">
            Built with Custom SIWF v2 Implementation • 
            <a 
              href="https://projectlibertylabs.github.io/siwf/v2/docs/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              SIWF Documentation
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
