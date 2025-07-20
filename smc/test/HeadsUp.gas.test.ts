import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { HeadsUp, MockVRFCoordinator } from "../typechain-types";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

describe("HeadsUp Gas Optimization Tests", function () {
  let headsUp: HeadsUp;
  let owner: HardhatEthersSigner;
  let player: HardhatEthersSigner;
  let mockVRFCoordinator: MockVRFCoordinator;

  // Environment variables with fallbacks
  const SUBSCRIPTION_ID = parseInt(process.env.VRF_SUBSCRIPTION_ID || "1");
  const KEY_HASH = process.env.VRF_KEY_HASH_ALFAJORES || "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4";
  const VRF_COORDINATOR = process.env.VRF_COORDINATOR_ALFAJORES || "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255";

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();

    const MockVRFCoordinatorFactory = await ethers.getContractFactory(
      "MockVRFCoordinator"
    );
    mockVRFCoordinator = await MockVRFCoordinatorFactory.deploy() as MockVRFCoordinator;
    await mockVRFCoordinator.waitForDeployment();

    const HeadsUpFactory = await ethers.getContractFactory("HeadsUp");
    headsUp = await upgrades.deployProxy(
      HeadsUpFactory,
      [
        owner.address,
        await mockVRFCoordinator.getAddress(),
        SUBSCRIPTION_ID,
        KEY_HASH,
      ],
      { initializer: "initialize" }
    ) as HeadsUp;
    await headsUp.waitForDeployment();

    await owner.sendTransaction({
      to: await headsUp.getAddress(),
      value: ethers.parseEther("1000"),
    });
  });

  it("Should have reasonable gas costs for flipCoin", async function () {
    const betAmount = ethers.parseEther("1");
    const choice = 1;

    const tx = await headsUp
      .connect(player)
      .flipCoin(choice, { value: betAmount });
    const receipt = await tx.wait();

    console.log(`flipCoin gas used: ${receipt?.gasUsed}`);
    expect(receipt?.gasUsed).to.be.lt(200000); // Should be under 200k gas
  });

  it("Should have reasonable gas costs for fulfillRandomWords", async function () {
    const betAmount = ethers.parseEther("1");
    const choice = 1;

    await headsUp.connect(player).flipCoin(choice, { value: betAmount });

    const tx = await mockVRFCoordinator.fulfillRandomWords(1, [1]);
    const receipt = await tx.wait();

    console.log(`fulfillRandomWords gas used: ${receipt?.gasUsed}`);
    expect(receipt?.gasUsed).to.be.lt(150000); // Should be under 150k gas
  });

  it("Should optimize gas for multiple consecutive games", async function () {
    const betAmount = ethers.parseEther("0.1");
    const choice = 1;
    const numGames = 5;
    let totalGasUsed = BigInt(0);

    for (let i = 0; i < numGames; i++) {
      const tx = await headsUp
        .connect(player)
        .flipCoin(choice, { value: betAmount });
      const receipt = await tx.wait();
      
      if (receipt?.gasUsed) {
        totalGasUsed += receipt.gasUsed;
      }
    }

    const averageGasPerGame = totalGasUsed / BigInt(numGames);
    console.log(`Average gas per game: ${averageGasPerGame}`);
    console.log(`Total gas for ${numGames} games: ${totalGasUsed}`);
    
    // Each game should use reasonable gas
    expect(averageGasPerGame).to.be.lt(200000);
  });

  it("Should have efficient gas usage for admin functions", async function () {
    // Test withdrawFunds gas usage
    const withdrawAmount = ethers.parseEther("10");
    const withdrawTx = await headsUp.connect(owner).withdrawFunds(withdrawAmount);
    const withdrawReceipt = await withdrawTx.wait();
    
    console.log(`withdrawFunds gas used: ${withdrawReceipt?.gasUsed}`);
    expect(withdrawReceipt?.gasUsed).to.be.lt(50000); // Should be under 50k gas

    // Test updateBetLimits gas usage
    const newMinBet = ethers.parseEther("0.02");
    const newMaxBet = ethers.parseEther("200");
    const updateTx = await headsUp.connect(owner).updateBetLimits(newMinBet, newMaxBet);
    const updateReceipt = await updateTx.wait();
    
    console.log(`updateBetLimits gas used: ${updateReceipt?.gasUsed}`);
    expect(updateReceipt?.gasUsed).to.be.lt(50000); // Should be under 50k gas
  });

  it("Should have predictable gas costs for view functions", async function () {
    // View functions should not consume gas when called statically
    const betAmount = ethers.parseEther("1");
    const choice = 1;

    // Make a game first
    await headsUp.connect(player).flipCoin(choice, { value: betAmount });

    // Test view functions (these should be free when called as view)
    const stats = await headsUp.getContractStats();
    const betLimits = await headsUp.getBetLimits();
    const vrfSettings = await headsUp.getVRFSettings();
    const playerGames = await headsUp.getPlayerGames(player.address);
    const gameDetails = await headsUp.getGameDetails(1);

    // Verify the calls returned data (indicating they work)
    expect(stats.length).to.equal(4);
    expect(betLimits.length).to.equal(2);
    expect(vrfSettings.length).to.equal(4);
    expect(playerGames.length).to.be.gte(1);
    expect(gameDetails.player).to.equal(player.address);
  });

  it("Should measure deployment gas costs", async function () {
    // Deploy a fresh contract to measure deployment costs
    const MockVRFCoordinatorFactory = await ethers.getContractFactory("MockVRFCoordinator");
    const newMockVRF = await MockVRFCoordinatorFactory.deploy();
    const mockDeployReceipt = await newMockVRF.deploymentTransaction()?.wait();
    
    console.log(`MockVRFCoordinator deployment gas: ${mockDeployReceipt?.gasUsed}`);

    const HeadsUpFactory = await ethers.getContractFactory("HeadsUp");
    const newHeadsUp = await upgrades.deployProxy(
      HeadsUpFactory,
      [
        owner.address,
        await newMockVRF.getAddress(),
        SUBSCRIPTION_ID,
        KEY_HASH,
      ],
      { initializer: "initialize" }
    );
    
    const headsUpDeployReceipt = await newHeadsUp.deploymentTransaction()?.wait();
    console.log(`HeadsUp proxy deployment gas: ${headsUpDeployReceipt?.gasUsed}`);
    
    // Deployment should be reasonable (these are rough estimates)
    expect(mockDeployReceipt?.gasUsed).to.be.lt(1000000); // Under 1M gas
    expect(headsUpDeployReceipt?.gasUsed).to.be.lt(2000000); // Under 2M gas
  });
});
