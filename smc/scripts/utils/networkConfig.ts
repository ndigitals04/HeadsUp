export interface NetworkConfig {
  vrfCoordinator: string;
  keyHash: string;
  name: string;
  vrfFee: string; // Fee for direct funding
}

export const networkConfigs: Record<string, NetworkConfig> = {
  localhost: {
    vrfCoordinator: "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255", // Mock for testing
    keyHash: "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
    vrfFee: "0.01", // 0.01 ETH for testing
    name: "Localhost"
  },
  hardhat: {
    vrfCoordinator: "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255", // Mock for testing
    keyHash: "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
    vrfFee: "0.01", // 0.01 ETH for testing
    name: "Hardhat"
  },
  alfajores: {
    vrfCoordinator: process.env.VRF_COORDINATOR_ALFAJORES || "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255",
    keyHash: process.env.VRF_KEY_HASH_ALFAJORES || "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4",
    vrfFee: process.env.VRF_FEE_ALFAJORES || "0.1", // 0.1 CELO
    name: "Celo Alfajores Testnet"
  },
  celo: {
    vrfCoordinator: process.env.VRF_COORDINATOR_CELO || "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
    keyHash: process.env.VRF_KEY_HASH_CELO || "0xff8dedfbfa60af186cf3c830acbc32c05aae823045ae5ea7da1e45fbfaba4f92",
    vrfFee: process.env.VRF_FEE_CELO || "0.1", // 0.1 CELO
    name: "Celo Mainnet"
  }
};

export function getNetworkConfig(networkName: string): NetworkConfig {
  const config = networkConfigs[networkName];
  if (!config) {
    throw new Error(`Network configuration not found for: ${networkName}`);
  }
  return config;
}