import React, { useState } from "react";
import { useSDK } from "@metamask/sdk-react";
import { ethers } from "ethers";

type MetaMaskProps = {
  onConnect: (walletAddress: string) => void;
};

export const MetaMask: React.FC<MetaMaskProps> = ({ onConnect }) => {
  const { sdk, connecting, provider, chainId } = useSDK();
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      if (accounts) {
        const walletAddress = accounts[0];
        setAccount(walletAddress);
        setConnected(true);
        onConnect(walletAddress); // Pass wallet address to parent component
        fetchBalance(walletAddress);
      }
    } catch (err) {
      console.error("Failed to connect to MetaMask:", err);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const rawBalance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(rawBalance);
      setBalance(formattedBalance);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const disconnect = () => {
    setAccount("");
    setBalance("0");
    setConnected(false);
  };

  return (
    <div>
      <h3>MetaMask Connection</h3>
      {connected ? (
        <>
          <p>Connected account: {account}</p>
          <p>Balance: {balance} ETH</p>
          <p>Connected chain: {chainId}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      ) : (
        <button onClick={connect}>Connect MetaMask</button>
      )}
    </div>
  );
};
