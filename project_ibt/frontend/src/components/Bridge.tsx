import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ETH_CONTRACT_ADDRESS, ETH_CONTRACT_ABI } from "../contracts/ethereum";
import { SUI_PACKAGE_ID, SUI_MODULE_NAME, SUI_TREASURY_CAP_ID } from "../contracts/sui";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentWallet, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { MetaMask } from "./MetaMask";
import { SuiWallet } from "./SuiWallet";
import { bcs } from "@mysten/bcs";  

declare global {
  interface Window {
    ethereum: any;
  }
}

const Bridge: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  

  const [ethWalletAddress, setEthWalletAddress] = useState<string | null>(null);
  const [suiWalletAddress, setSuiWalletAddress] = useState<string | null>(null);


  const getBalance = async (account: string) => {
    try {
      const paddedAddress = account.slice(2).padStart(64, '0');
      const balanceData = `0x70a08231${paddedAddress}`; // balanceOf(address)
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: ETH_CONTRACT_ADDRESS,
          data: balanceData,
        }, 'latest'],
      });
      const balanceInEth = BigInt(balance) / BigInt(1e18);
      setBalance(balanceInEth.toString());
      return balance;
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0";
    }
  };

  const handleMintEth = async () => {
    if (!amount || !window.ethereum) {
      setTxStatus("Please ensure MetaMask is connected and amount is entered");
      return;
    }

    try {
      setLoading(true);
      setTxStatus("Starting mint...");

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      const account = accounts[0];

      const amountFloat = parseFloat(amount);
      if (isNaN(amountFloat) || amountFloat <= 0) {
        throw new Error("Invalid amount");
      }

      const amountInWei = BigInt(Math.floor(amountFloat * 1e18));
      const functionSelector = '0x40c10f19';
      const paddedAddress = account.slice(2).padStart(64, '0');
      const paddedAmount = amountInWei.toString(16).padStart(64, '0');
      const data = `${functionSelector}${paddedAddress}${paddedAmount}`;

      const tx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: ETH_CONTRACT_ADDRESS,
          data,
          gas: '0x30D40',
        }],
      });

      setTxStatus("Minting... Please wait for confirmation");

      let receipt;
      while (!receipt) {
        receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [tx],
        });

        if (receipt) {
          if (receipt.status === '0x1') {
            await getBalance(account);
            setTxStatus("Tokens minted successfully!");
            break;
          } else {
            throw new Error("Mint transaction failed");
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.error("Mint error:", error);
      setTxStatus(`Mint failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        if (accounts.length > 0) {
          await getBalance(accounts[0]);
        }
      }
    };
    fetchBalance();
  }, []);

  const handleMetaMaskConnect = async (walletAddress: string) => {
    setEthWalletAddress(walletAddress);
    setStatus(`Connected Ethereum Wallet: ${walletAddress}`);
  };

  const handleSuiConnect = async (walletAddress: string) => {
    setSuiWalletAddress(walletAddress);
    setStatus(`Connected Sui Wallet: ${walletAddress}`);
  };


  const handleEthtoSui = async () => {
    if (!ethWalletAddress || !suiWalletAddress) {
      setStatus("Please connect both Ethereum and Sui wallets.");
      return;
    }

    try {
      setStatus("Initiating ETH burn on Ethereum...");
      
      // Burn ETH on Ethereum
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner(ethWalletAddress);

      const ethContract = new ethers.Contract(ETH_CONTRACT_ADDRESS, ETH_CONTRACT_ABI, signer);

      const burnTx = await ethContract.burn(amount, SUI_TREASURY_CAP_ID); // Pass treasury cap ID for SUI
      await burnTx.wait();

      setStatus("ETH burn confirmed. Minting on SUI...");
      
      // Mint SUI on Sui
      const suiTx = new Transaction();

      const amountAsBigInt = BigInt(amount); // Convert to BigInt

      suiTx.moveCall({
        target: `${SUI_PACKAGE_ID}::${SUI_MODULE_NAME}::mint`,
        arguments: [
          suiTx.pure.address(suiWalletAddress), 
          suiTx.pure.u64(amountAsBigInt),       
        ],
      });

      await signAndExecuteTransaction(
        {
          transaction: suiTx,
          chain: "sui:localnet",
        },
        {
          onSuccess: (result) => {
            console.log("SUI transaction result:", result);
            setStatus("Tokens bridged successfully from ETH to SUI!");
          },
          onError: (error) => {
            console.error("SUI transaction failed:", error);
            setStatus("SUI transaction failed.");
          },
        }
      );
    } catch (error) {
      console.error("Bridge failed:", error);
      // setStatus(`Bridge failed: ${error.message}`);
    }
  };

  // Handle SUI to ETH Bridge
  const handleSuitoEth = async () => {
    if (!ethWalletAddress || !suiWalletAddress) {
      setStatus("Please connect both Ethereum and Sui wallets.");
      return;
    }

    try {
      setStatus("Initiating SUI burn on Sui...");

      // Burn SUI on Sui
      const suiTx = new Transaction();
 
      const amountAsBigInt = BigInt(amount); // Convert to BigInt

      suiTx.moveCall({
        target: `${SUI_PACKAGE_ID}::${SUI_MODULE_NAME}::burn`,
        arguments: [
          suiTx.pure.address(suiWalletAddress),
          suiTx.pure.u64(amountAsBigInt),       
        ],
      });

      await signAndExecuteTransaction(
        {
          transaction: suiTx,
          chain: "sui:localnet",
        },
        {
          onSuccess: async (result) => {
            console.log("SUI transaction result:", result);
            setStatus("SUI burn confirmed. Minting on Ethereum...");

            // Mint ETH on Ethereum
            const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const signer = await provider.getSigner(ethWalletAddress);
      
            const ethContract = new ethers.Contract(ETH_CONTRACT_ADDRESS, ETH_CONTRACT_ABI, signer);

            const mintTx = await ethContract.mint(ethWalletAddress || "", amount);
            await mintTx.wait();

            setStatus("Tokens bridged successfully from SUI to ETH!");
          },
          onError: (error) => {
            console.error("SUI transaction failed:", error);
            setStatus("SUI transaction failed.");
          },
        }
      );
    } catch (error) {
      console.error("Bridge failed:", error);
      // setStatus(`Bridge failed: ${error.message}`);
    }
  };



  return (
    <div id="root">
     <div>
        <MetaMask onConnect={handleMetaMaskConnect}/>
      </div>
      <div>
        <SuiWallet onConnect={handleSuiConnect}/>
      </div>

      <h2>Token Bridge</h2>
      <div className="mb-4">
        <label htmlFor="amount">Amount to bridge:</label>
        <input
          id="amount"
          placeholder="Enter amount"
          type="number"
          step="0.0001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="ml-2"
        />
      </div>
      <br></br>
      
      <div className="space-y-4">
        <button
          onClick={handleMintEth}
          disabled={loading || !amount}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : "Mint Tokens (Test)"}
        </button>

        <button 
          onClick={handleEthtoSui} 
          disabled={loading || !amount}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Bridging..." : "Bridge Ethereum → Sui"}
        </button>

          <br></br>
          <br></br>
        <button 
          onClick={handleSuitoEth} 
          disabled={loading || !amount}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? "Bridging..." : "Bridge Sui → Ethereum"}
        </button>

        {txStatus && (
          <div className={`p-4 rounded-lg ${
            txStatus.includes("failed") || txStatus.includes("reverted")
              ? "bg-red-900/50 border border-red-700 text-red-200"
              : "bg-blue-900/50 border border-blue-700 text-blue-200"
          }`}>
            {txStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bridge;