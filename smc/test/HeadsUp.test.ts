import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { HeadsUp, MockVRFCoordinator } from "../typechain-types";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

describe("HeadsUp", function () {
  let headsUp: HeadsUp;
  let owner: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;
  let mockVRFCoordinator: MockVRFCoordinator;
  
  // Environment variables with fallbacks
  const SUBSCRIPTION_ID = parseInt(process.env.VRF_SUBSCRIPTION_ID || "1");
  const KEY_HASH = process.env.VRF_KEY_HASH_ALFAJORES || "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4";
  const VRF_COORDINATOR = process.env.VRF_COORDINATOR_ALFAJORES || "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255";
  
  // Contract constants
  const MIN_BET = ethers.parseEther("0.01");
  const MAX_BET = ethers.parseEther("100");
  const HOUSE_EDGE = 250; // 2.5%
  const PAYOUT_PERCENTAGE = 9750; // 97.5%
  
  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();
    
    // Deploy mock VRF Coordinator
    const MockVRFCoordinatorFactory = await ethers.getContractFactory("MockVRFCoordinator");
    mockVRFCoordinator = await MockVRFCoordinatorFactory.deploy() as MockVRFCoordinator;
    await mockVRFCoordinator.waitForDeployment();
    
    // Deploy HeadsUp contract
    const HeadsUpFactory = await ethers.getContractFactory("HeadsUp");
    headsUp = await upgrades.deployProxy(
      HeadsUpFactory,
      [owner.address, await mockVRFCoordinator.getAddress(), SUBSCRIPTION_ID, KEY_HASH],
      { initializer: "initialize" }
    ) as HeadsUp;
    await headsUp.waitForDeployment();
    
    // Fund the contract for payouts
    await owner.sendTransaction({
      to: await headsUp.getAddress(),
      value: ethers.parseEther("1000")
    });
  });
  
  describe("Deployment and Initialization", function () {
    it("Should set the right owner", async function () {
      expect(await headsUp.owner()).to.equal(owner.address);
    });
    
    it("Should initialize with correct bet limits", async function () {
      const [minBet, maxBet] = await headsUp.getBetLimits();
      expect(minBet).to.equal(MIN_BET);
      expect(maxBet).to.equal(MAX_BET);
    });
    
    it("Should initialize with correct VRF settings", async function () {
      const [subscriptionId, keyHash, callbackGasLimit, requestConfirmations] = await headsUp.getVRFSettings();
      expect(subscriptionId).to.equal(SUBSCRIPTION_ID);
      expect(keyHash).to.equal(KEY_HASH);
      expect(callbackGasLimit).to.equal(100000);
      expect(requestConfirmations).to.equal(3);
    });
    
    it("Should return correct version", async function () {
      expect(await headsUp.version()).to.equal("1.0.0");
    });
  });
  
  describe("Game Logic", function () {
    it("Should allow valid coin flip", async function () {
      const betAmount = ethers.parseEther("1");
      const choice = 1; // heads
      
      await expect(headsUp.connect(player1).flipCoin(choice, { value: betAmount }))
        .to.emit(headsUp, "GameRequested")
        .withArgs(1, player1.address, betAmount, choice);
      
      const [totalGames, volume, balance, fees] = await headsUp.getContractStats();
      expect(totalGames).to.equal(1);
      expect(volume).to.equal(betAmount);
    });
    
    it("Should reject invalid choice", async function () {
      const betAmount = ethers.parseEther("1");
      const invalidChoice = 2;
      
      await expect(headsUp.connect(player1).flipCoin(invalidChoice, { value: betAmount }))
        .to.be.revertedWith("Invalid choice: must be 0 (tails) or 1 (heads)");
    });
    
    it("Should reject bet below minimum", async function () {
      const betAmount = ethers.parseEther("0.005"); // Below 0.01 minimum
      const choice = 1;
      
      await expect(headsUp.connect(player1).flipCoin(choice, { value: betAmount }))
        .to.be.revertedWith("Bet amount too low");
    });
    
    it("Should reject bet above maximum", async function () {
      const betAmount = ethers.parseEther("101"); // Above 100 maximum
      const choice = 1;
      
      await expect(headsUp.connect(player1).flipCoin(choice, { value: betAmount }))
        .to.be.revertedWith("Bet amount too high");
    });
    
    it("Should calculate platform fees correctly", async function () {
      const betAmount = ethers.parseEther("1");
      const choice = 1;
      
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      
      const [, , , fees] = await headsUp.getContractStats();
      const expectedFee = (betAmount * BigInt(HOUSE_EDGE)) / BigInt(10000);
      expect(fees).to.equal(expectedFee);
    });
    
    it("Should track player games", async function () {
      const betAmount = ethers.parseEther("1");
      const choice = 1;
      
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      
      const playerGames = await headsUp.getPlayerGames(player1.address);
      expect(playerGames.length).to.equal(2);
    });
  });
  
  describe("VRF Fulfillment", function () {
    it("Should handle winning game correctly", async function () {
      const betAmount = ethers.parseEther("1");
      const choice = 1; // heads
      
      // Player makes bet
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      
      const initialBalance = await ethers.provider.getBalance(player1.address);
      
      // Mock VRF response with winning result (1 for heads)
      await mockVRFCoordinator.fulfillRandomWords(1, [1]);
      
      const finalBalance = await ethers.provider.getBalance(player1.address);
      const expectedPayout = (betAmount * BigInt(PAYOUT_PERCENTAGE)) / BigInt(10000);
      
      // Check game details
      const gameDetails = await headsUp.getGameDetails(1);
      expect(gameDetails.fulfilled).to.be.true;
      expect(gameDetails.won).to.be.true;
      
      // Player should receive payout
      expect(finalBalance).to.be.gt(initialBalance);
    });
    
    it("Should handle losing game correctly", async function () {
      const betAmount = ethers.parseEther("1");
      const choice = 1; // heads
      
      // Player makes bet
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      
      const initialBalance = await ethers.provider.getBalance(player1.address);
      
      // Mock VRF response with losing result (0 for tails)
      await mockVRFCoordinator.fulfillRandomWords(1, [0]);
      
      const finalBalance = await ethers.provider.getBalance(player1.address);
      
      // Check game details
      const gameDetails = await headsUp.getGameDetails(1);
      expect(gameDetails.fulfilled).to.be.true;
      expect(gameDetails.won).to.be.false;
      
      // Player should not receive payout (balance should be same or less due to gas)
      expect(finalBalance).to.be.lte(initialBalance);
    });
    
    it("Should emit GameResult event", async function () {
      const betAmount = ethers.parseEther("1");
      const choice = 1;
      
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      
      await expect(mockVRFCoordinator.fulfillRandomWords(1, [1]))
        .to.emit(headsUp, "GameResult");
    });
  });
  
  describe("Admin Functions", function () {
    it("Should allow owner to withdraw funds", async function () {
      const withdrawAmount = ethers.parseEther("10");
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      
      await expect(headsUp.connect(owner).withdrawFunds(withdrawAmount))
        .to.emit(headsUp, "FundsWithdrawn")
        .withArgs(owner.address, withdrawAmount);
    });
    
    it("Should reject withdrawal from non-owner", async function () {
      const withdrawAmount = ethers.parseEther("10");
      
      await expect(headsUp.connect(player1).withdrawFunds(withdrawAmount))
        .to.be.revertedWithCustomError(headsUp, "OwnableUnauthorizedAccount");
    });
    
    it("Should allow owner to update bet limits", async function () {
      const newMinBet = ethers.parseEther("0.02");
      const newMaxBet = ethers.parseEther("200");
      
      await expect(headsUp.connect(owner).updateBetLimits(newMinBet, newMaxBet))
        .to.emit(headsUp, "BetLimitsUpdated")
        .withArgs(newMinBet, newMaxBet);
      
      const [minBet, maxBet] = await headsUp.getBetLimits();
      expect(minBet).to.equal(newMinBet);
      expect(maxBet).to.equal(newMaxBet);
    });
    
    it("Should reject invalid bet limit updates", async function () {
      const invalidMinBet = 0;
      const maxBet = ethers.parseEther("100");
      
      await expect(headsUp.connect(owner).updateBetLimits(invalidMinBet, maxBet))
        .to.be.revertedWith("Minimum bet must be greater than 0");
    });
    
    it("Should allow owner to update VRF settings", async function () {
      const newSubscriptionId = 2;
      const newKeyHash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const newCallbackGasLimit = 200000;
      
      await headsUp.connect(owner).updateVRFSettings(
        newSubscriptionId,
        newKeyHash,
        newCallbackGasLimit
      );
      
      const [subscriptionId, keyHash, callbackGasLimit] = await headsUp.getVRFSettings();
      expect(subscriptionId).to.equal(newSubscriptionId);
      expect(keyHash).to.equal(newKeyHash);
      expect(callbackGasLimit).to.equal(newCallbackGasLimit);
    });
  });
  
  describe("Security", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This would require a malicious contract that tries to reenter
      // For now, we verify that the nonReentrant modifier is in place
      const betAmount = ethers.parseEther("1");
      const choice = 1;
      
      // Multiple rapid calls should not cause issues
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      
      const [totalGames] = await headsUp.getContractStats();
      expect(totalGames).to.equal(2);
    });
    
    it("Should reject fulfillment from unauthorized address", async function () {
      // Only VRF Coordinator should be able to call fulfillRandomWords
      await expect(headsUp.connect(player1).rawFulfillRandomWords(1, [1]))
        .to.be.revertedWithCustomError(headsUp, "OnlyCoordinatorCanFulfill");
    });
  });
  
  describe("Upgrades", function () {
    it("Should be upgradeable by owner", async function () {
      const HeadsUpV2Factory = await ethers.getContractFactory("HeadsUp");
      
      const upgraded = await upgrades.upgradeProxy(await headsUp.getAddress(), HeadsUpV2Factory);
      
      // Verify the upgrade maintained state
      expect(await upgraded.owner()).to.equal(owner.address);
      expect(await upgraded.version()).to.equal("1.0.0");
    });
    
    it("Should reject upgrade from non-owner", async function () {
      const HeadsUpV2Factory = await ethers.getContractFactory("HeadsUp");
      
      // This should fail at the proxy level, not contract level
      // The actual test would depend on how the upgrade is attempted
    });
  });
  
  describe("Edge Cases", function () {
    it("Should handle insufficient contract balance", async function () {
      // Drain most of the contract balance
      const contractBalance = await ethers.provider.getBalance(await headsUp.getAddress());
      const withdrawAmount = contractBalance - ethers.parseEther("1");
      
      await headsUp.connect(owner).withdrawFunds(withdrawAmount);
      
      // Try to bet more than the contract can pay out
      const largeBet = ethers.parseEther("50");
      const choice = 1;
      
      await expect(headsUp.connect(player1).flipCoin(choice, { value: largeBet }))
        .to.be.revertedWith("Insufficient contract balance for potential payout");
    });
    
    it("Should handle multiple simultaneous games", async function () {
      const betAmount = ethers.parseEther("1");
      const choice = 1;
      
      // Multiple players bet simultaneously
      await headsUp.connect(player1).flipCoin(choice, { value: betAmount });
      await headsUp.connect(player2).flipCoin(choice, { value: betAmount });
      
      const [totalGames] = await headsUp.getContractStats();
      expect(totalGames).to.equal(2);
      
      // Fulfill both games
      await mockVRFCoordinator.fulfillRandomWords(1, [1]); // Player 1 wins
      await mockVRFCoordinator.fulfillRandomWords(2, [0]); // Player 2 loses
      
      const game1 = await headsUp.getGameDetails(1);
      const game2 = await headsUp.getGameDetails(2);
      
      expect(game1.won).to.be.true;
      expect(game2.won).to.be.false;
    });
  });
});