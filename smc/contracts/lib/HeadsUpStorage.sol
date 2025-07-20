// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract HeadsUpStorage is Initializable {
    // Game state
    struct GameRequest {
        address player;
        uint256 amount;
        uint8 playerChoice; // 0 for tails, 1 for heads
        bool fulfilled;
        bool won;
        uint256 timestamp;
        uint256 randomNumber; // Store the random number from frontend
        uint8 coinResult; // Store the final coin flip result
    }

    mapping(uint256 => GameRequest) internal gameRequests;
    mapping(address => uint256[]) internal playerGames;
    
    // Game counter for generating unique request IDs
    uint256 internal gameCounter;

    // Contract state
    uint256 internal totalGamesPlayed;
    uint256 internal totalVolume;
    uint256 internal contractBalance;
    uint256 internal platformFees;

    // Constants
    uint256 internal constant HOUSE_EDGE = 250; // 2.5% in basis points
    uint256 internal constant PAYOUT_PERCENTAGE = 9750; // 97.5% in basis points
    uint256 internal constant BASIS_POINTS = 10000;

    // Minimum and maximum bet amounts
    uint256 internal minBetAmount;
    uint256 internal maxBetAmount;

    // Events for Frontend Tracking
    event GameRequested(
        uint256 indexed requestId,
        address indexed player,
        uint256 amount,
        uint8 playerChoice,
        uint256 timestamp
    );
    
    event GameResult(
        uint256 indexed requestId,
        address indexed player,
        uint256 amount,
        uint8 playerChoice,
        uint8 result,
        bool won,
        uint256 payout,
        uint256 randomNumber,
        uint256 timestamp
    );
    
    event GameCompleted(
        uint256 indexed requestId,
        address indexed player,
        bool won,
        uint256 payout
    );
    
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event BetLimitsUpdated(uint256 minBet, uint256 maxBet);

    function __HeadsUpStorage_init() internal onlyInitializing {
        minBetAmount = 0.01 ether; // 0.01 CELO minimum
        maxBetAmount = 100 ether; // 100 CELO maximum
        gameCounter = 1; // Start game counter at 1
    }
}
