import { ethers } from "ethers";
import contractAbi from "../FE/lib/localhost-abi.json"; // adjust if ABI path is different

// 👉 Replace with your deployed contract address
const contractAddress = "0xYourContractAddressHere";

// 👉 Celo Alfajores RPC
const provider = new ethers.JsonRpcProvider("https://alfajores-forno.celo-testnet.org");

// 👉 Replace with your private key (from MetaMask, prefixed with 0x)
// ⚠️ IMPORTANT: Never commit or share this private key
const privateKey = "0xYOUR_PRIVATE_KEY";

async function main() {
  const signer = new ethers.Wallet(privateKey, provider);

  console.log("Funding from:", await signer.getAddress());

  const contract = new ethers.Contract(contractAddress, contractAbi, signer);

  // Send 5 CELO into the contract
  const tx = await contract.fundContract({
    value: ethers.parseEther("5"),
  });

  console.log("⏳ Transaction sent:", tx.hash);
  await tx.wait();

  console.log("✅ Contract funded with 5 CELO");
}

main().catch((err) => {
  console.error("❌ Error funding contract:", err);
  process.exit(1);
});
