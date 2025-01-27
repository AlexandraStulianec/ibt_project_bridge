import React from "react";
import { ConnectButton, useCurrentWallet } from "@mysten/dapp-kit";

type SuiWalletProps = {
  onConnect: (walletAddress: string) => void;
};

export const SuiWallet: React.FC<SuiWalletProps> = ({ onConnect }) => {
  const { currentWallet, connectionStatus } = useCurrentWallet();

  // Trigger onConnect callback when wallet is connected
  React.useEffect(() => {
    if (currentWallet) {
      const walletAddress = currentWallet.accounts[0]?.address;
      if (walletAddress) {
        onConnect(walletAddress);
      }
    }
  }, [currentWallet, onConnect]);

  return (
    <div>
      <h3>Sui Connection Status: {connectionStatus}</h3>
      <ConnectButton />
      {currentWallet && (
        <p className="connectedsui">Connected Sui wallet: {currentWallet.accounts[0].address}</p>
      )}
    </div>
  );
};
