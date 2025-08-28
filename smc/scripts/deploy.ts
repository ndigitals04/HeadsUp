import { ethers, upgrades, network } from "hardhat";
import fs from "fs";
import path from "path";

// Helper function to get implementation address with retry logic
async function getImplementationAddressWithRetry(
  proxyAddress: string,
  maxRetries: number = 5,
  delay: number = 2000
): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempting to get implementation address (attempt ${i + 1}/${maxRetries})...`);
      const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
      console.log("Implementation address:", implementationAddress);
      return implementationAddress;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`Attempt ${i + 1} failed:`, errorMessage);
      if (i === maxRetries - 1) {
        console.log("All attempts failed. Using fallback...");
        return "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE";
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return "IMPLEMENTATION_ADDRESS_NOT_AVAILABLE";
}

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // =============================
  // Deploy HeadsUp Proxy
  // =============================
  const HeadsUp = await ethers.getContractFactory("HeadsUp");

  console.log("Deploying HeadsUp proxy...");
  const headsUp = await upgrades.deployProxy(
    HeadsUp,
    [deployer.address],
    { initializer: "initialize" }
  );

  await headsUp.waitForDeployment();
  const headsUpProxyAddress: string = await headsUp.getAddress();

  console.log("HeadsUp Proxy Contract Deployed at:", headsUpProxyAddress);

  console.log("Waiting for HeadsUp proxy initialization...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  const headsUpImplementationAddress = await getImplementationAddressWithRetry(headsUpProxyAddress);

  // =============================
  // Deploy GameLogic Proxy
  // =============================
  const GameLogic = await ethers.getContractFactory("GameLogic");

  console.log("Deploying GameLogic proxy...");
  const gameLogic = await upgrades.deployProxy(
    GameLogic,
    [],
    { initializer: "initialize" }
  );

  await gameLogic.waitForDeployment();
  const gameLogicProxyAddress: string = await gameLogic.getAddress();

  console.log("GameLogic Proxy Contract Deployed at:", gameLogicProxyAddress);

  console.log("Waiting for GameLogic proxy initialization...");
  await new Promise(resolve => setTimeout(resolve, 3000));

  const gameLogicImplementationAddress = await getImplementationAddressWithRetry(gameLogicProxyAddress);

  // =============================
  // Save Addresses
  // =============================
  const contractAddresses = {
    headsUp: {
      proxyAddress: headsUpProxyAddress,
      implementationAddress: headsUpImplementationAddress,
    },
    gameLogic: {
      proxyAddress: gameLogicProxyAddress,
      implementationAddress: gameLogicImplementationAddress,
    },
    network: network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const addressesDir = path.join(__dirname, "../addresses");
  if (!fs.existsSync(addressesDir)) {
    fs.mkdirSync(addressesDir, { recursive: true });
  }

  // Generate TypeScript file content
  const tsContent = `// Auto-generated file - Do not edit manually
// Generated on: ${new Date().toISOString()}
// Network: ${network.name}

export interface ContractAddresses {
  headsUp: {
    proxyAddress: string;
    implementationAddress: string;
  };
  gameLogic: {
    proxyAddress: string;
    implementationAddress: string;
  };
  network: string;
  deployedAt: string;
  deployer: string;
}

export const contractAddresses: ContractAddresses = ${JSON.stringify(contractAddresses, null, 2)};

export const HEADSUP_PROXY_ADDRESS = "${headsUpProxyAddress}";
export const HEADSUP_IMPLEMENTATION_ADDRESS = "${headsUpImplementationAddress}";
export const GAMELOGIC_PROXY_ADDRESS = "${gameLogicProxyAddress}";
export const GAMELOGIC_IMPLEMENTATION_ADDRESS = "${gameLogicImplementationAddress}";

export default contractAddresses;
`;

  const tsFilePath = path.join(addressesDir, `${network.name}-addresses.ts`);
  fs.writeFileSync(tsFilePath, tsContent);
  console.log(`Contract addresses saved to: ${tsFilePath}`);

  const jsonFilePath = path.join(addressesDir, `${network.name}-addresses.json`);
  fs.writeFileSync(jsonFilePath, JSON.stringify(contractAddresses, null, 2));
  console.log(`Contract addresses also saved as JSON to: ${jsonFilePath}`);

  // =============================
  // Save ABIs
  // =============================
  const headsUpABI = HeadsUp.interface.formatJson();
  const headsUpAbiFilePath = path.join(addressesDir, `${network.name}-headsUp-abi.json`);
  fs.writeFileSync(headsUpAbiFilePath, headsUpABI);
  console.log(`HeadsUp ABI saved to: ${headsUpAbiFilePath}`);

  const gameLogicABI = GameLogic.interface.formatJson();
  const gameLogicAbiFilePath = path.join(addressesDir, `${network.name}-gameLogic-abi.json`);
  fs.writeFileSync(gameLogicAbiFilePath, gameLogicABI);
  console.log(`GameLogic ABI saved to: ${gameLogicAbiFilePath}`);

  // =============================
  // Copy to Frontend
  // =============================
  const frontendContractsDir = path.join(__dirname, "../../FE/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
    console.log(`Created frontend contracts directory: ${frontendContractsDir}`);
  }

  const frontendTsPath = path.join(frontendContractsDir, "addresses.ts");
  fs.copyFileSync(tsFilePath, frontendTsPath);
  console.log(`Contract addresses copied to frontend: ${frontendTsPath}`);

  const frontendHeadsUpAbiPath = path.join(frontendContractsDir, `${network.name}-headsUp-abi.json`);
  fs.copyFileSync(headsUpAbiFilePath, frontendHeadsUpAbiPath);
  console.log(`HeadsUp ABI copied to frontend: ${frontendHeadsUpAbiPath}`);

  const frontendGameLogicAbiPath = path.join(frontendContractsDir, `${network.name}-gameLogic-abi.json`);
  fs.copyFileSync(gameLogicAbiFilePath, frontendGameLogicAbiPath);
  console.log(`GameLogic ABI copied to frontend: ${frontendGameLogicAbiPath}`);

  console.log("");

  // =============================
  // Test the deployed contracts
  // =============================
  console.log("Testing deployed contracts...");
  try {
    const headsUpInstance = await ethers.getContractAt("HeadsUp", headsUpProxyAddress, deployer);
    const gameLogicInstance = await ethers.getContractAt("GameLogic", gameLogicProxyAddress, deployer);

    const versionHU = await headsUpInstance.version();
    console.log("HeadsUp version:", versionHU);

    const ownerHU = await headsUpInstance.owner();
    console.log("HeadsUp owner:", ownerHU);

    const versionGL = await gameLogicInstance.version();
    console.log("GameLogic version:", versionGL);

    console.log("✅ Contract deployment and testing successful!");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("⚠️  Contract testing failed:", errorMessage);
    console.log("But deployment was successful.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
