# Bridge Between Ethereum and Sui

This project implements a bridge between **Ethereum** and **Sui** blockchains, allowing users to transfer IBT tokens between the two chains. The bridge works by burning tokens on the source chain and minting them on the destination chain.

---

## Technologies Used

- **Blockchain Frameworks**:
  - [Sui](https://sui.io/): A high-performance blockchain platform.
  - [Foundry (Forge)](https://book.getfoundry.sh/): A toolkit for Ethereum development.
  - [OpenZeppelin](https://openzeppelin.com/): Library for secure smart contract development.

- **Frontend**:
  - [Vite](https://vitejs.dev/): A fast build tool for modern web applications.
  - [React](https://reactjs.org/): A JavaScript library for building user interfaces.
  - [TypeScript](https://www.typescriptlang.org/): A typed superset of JavaScript.
  - [ethers.js](https://docs.ethers.io/): A library for interacting with Ethereum.
  - [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit): A toolkit for building Sui dApps.

---

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **Sui CLI**
3. **Foundry (Forge & Anvil)**
4. **MetaMask** (browser extension)
5. **Sui Wallet** (browser extension)
6. **VSCode (to write and edit code)
---

## Installation

### 1. Install Node.js
- **Windows**:
  Download and install from [Node.js official website](https://nodejs.org/).
- **macOS**:
  ```bash
  brew install node
  ```
- **Linux**
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```

### 2. Install Sui CLI
- **Windows**:
  Download the latest release from the [Sui GitHub releases page](https://github.com/MystenLabs/sui/releases) and add it to your PATH.
- **macOS**:
  ```bash
  brew install sui
  ```
- **Linux**
  ```bash
  curl -fsSL https://get.sui.io | bash
  ```

### 3. Install Foundry(Forge)
- **Windows**:
  ```powershell
  curl -L https://foundry.paradigm.xyz | powershell
  foundryup
  ```
- **macOS**:
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```
- **Linux**
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

### 4. Install MetaMask and Sui Wallet
- **MetaMask**: Install the [MetaMask broweser extension](https://metamask.io/)
- **Sui Wallet**: Install the [Sui Wallet]([https://metamask.io/](https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil))
  
---

## Setup Instructions

### 1. Clone the repository:
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install frontend dependencies:
```bash
cd frontend
npm install
```

### 3. Install Ethereum contract dependencies:
```bash
cd ../ethereum
forge install
```

### 4. Build the Sui contract:
```bash
cd ../sui-contract
sui move build
```
---

## Deploying Contracts

### Ethereum Contract

#### 1. Start a local Ethereum node (Anvil):
```bash
anvil
```

#### 2. In a new terminal, deploy the contract:
```bash
cd ethereum
forge create --rpc-url http://localhost:8545 --private-key <PRIVATE_KEY> src/IBToken.sol:IBToken
```
> **Note**: Replace `<PRIVATE_KEY>` with your Anvil private key.

#### 3. Update the contract address in the frontend configuration:
   - Open `frontend/src/contracts/ethereum.ts`
   - Update `ETH_CONTRACT_ADDRESS` with the deployed contract address

### Sui Contract

#### 1. Deploy the Sui contract to the local network:
```bash
cd sui-contract
sui client publish --gas-budget 100000000
```

#### 2. Update the following constants in `frontend/src/contracts/sui.ts`:
   - `SUI_PACKAGE_ID`: Package ID from deployment output
   - `SUI_TREASURY_CAP_ID`: TreasuryCap object ID from deployment output

## Running the Frontend

### 1. Start the frontend development server:
```bash
cd frontend
npm run dev
```

### 2. Access the application:
   - Open your browser and navigate to `http://localhost:5173`

### 3. Connect your wallets:
   - **MetaMask**: Connect to Anvil (localhost:8545)
   - **Sui Wallet**: Connect to the local Sui network with sui start

