export const ETH_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const ETH_CONTRACT_ABI = [
    "function mint(address to, uint256 amount) public",
    "function burn(address from, uint256 amount) public",
    "function balanceOf(address account) view returns (uint256)",
    "event TokensMinted(address indexed to, uint256 amount)",
    "event TokensBurned(address indexed from, uint256 amount)"
];