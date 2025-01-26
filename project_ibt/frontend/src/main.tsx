import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MetaMaskProvider } from "@metamask/sdk-react";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getFullnodeUrl } from "@mysten/sui/client";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={{
          devnet: { url: getFullnodeUrl("devnet") },
          localnet: { url: getFullnodeUrl("localnet") },
        }}
        defaultNetwork="devnet" 
      >
        <WalletProvider>
          <MetaMaskProvider
            sdkOptions={{
              dappMetadata: {
                name: "IBT Token Bridge",
                url: window.location.href,
              },
            }}
          >
            <App />
          </MetaMaskProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);