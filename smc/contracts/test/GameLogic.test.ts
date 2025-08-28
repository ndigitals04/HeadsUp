import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

describe("GameLogic (Upgradeable)", function () {
  let game: Contract;
  let owner: any;
  let player: any;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();

    const GameLogic = await ethers.getContractFactory("GameLogic");

    // Deploy proxy (upgradeable contract)
    game = await upgrades.deployProxy(GameLogic, [], {
      initializer: "__HeadsUpStorage_init", // calls storage init
    });

    await game.waitForDeployment();
  });

  it("should allow a player to flip and win/lose", async function () {
    const betAmount = ethers.parseEther("1.0");

    // Player flips a coin (random number picked arbitrarily)
    const tx = await game.connect(player).flipCoin(1, 12345, { value: betAmount });
    const receipt = await tx.wait();

    // Verify events emitted
    const event = receipt.logs.find(
      (log: any) => log.fragment?.name === "GameCompleted"
    );
    expect(event).to.not.be.undefined;

    const requestId = await game.getCurrentGameCounter();
    const gameDetails = await game.getGameDetails(requestId - 1n);

    expect(gameDetails.player).to.equal(player.address);
    expect(gameDetails.amount).to.equal(betAmount);
  });

  it("should revert if bet amount is too low", async function () {
    await expect(
      game.connect(player).flipCoin(0, 12345, { value: ethers.parseEther("0.001") })
    ).to.be.revertedWith("Bet amount too low");
  });

  it("should track player games", async function () {
    await game.connect(player).flipCoin(0, 99999, { value: ethers.parseEther("1") });

    const games = await game.getPlayerGames(player.address);
    expect(games.length).to.equal(1);
  });
});
