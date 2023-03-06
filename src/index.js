import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, goerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";


  const { chains, provider } = configureChains(
    [mainnet, polygon, optimism, arbitrum, goerli],
    [
      jsonRpcProvider({
        rpc: (chain) => ({
          http: `https://eth-goerli.g.alchemy.com/v2/U4Q5B-2_p_WUMX2gBCL_ZYNpaRetbTgd`,
          webSocket: `wss://eth-goerli.g.alchemy.com/v2/U4Q5B-2_p_WUMX2gBCL_ZYNpaRetbTgd`,
        }),
      }),
    ]
  );

  const { connectors } = getDefaultWallets({
    appName: 'My RainbowKit App',
    chains
  });

  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
  })

  

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider 
        chains={chains}
        showRecentTransactions={true}
        modalSize="compact"
        >
          <App />
        </RainbowKitProvider>
      </WagmiConfig>
  </React.StrictMode>
);

