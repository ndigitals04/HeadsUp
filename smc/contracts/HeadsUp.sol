// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./lib/HeadsUpStorage.sol";
import "./lib/GameLogic.sol";
import "./lib/AdminFunctions.sol";

/**
 * @title HeadsUp
 * @dev Simple 50/50 coin flip game contract using frontend-generated randomness
 * @notice This contract allows users to play coin flip games with CELO tokens
 * Features:
 * - Frontend-generated randomness for immediate game resolution
 * - 97.5% payout rate (2.5% house edge)
 * - Upgradeable using OpenZeppelin's Transparent Proxy pattern
 * - Modular architecture with separate storage, logic, and admin contracts
 * - Enhanced events for frontend tracking
 */
contract HeadsUp is
    Initializable,
    HeadsUpStorage,
    GameLogic,
    AdminFunctions
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param initialOwner The initial owner of the contract
     */
    function initialize(
        address initialOwner
    ) public initializer {
        __HeadsUpStorage_init();
        __GameLogic_init();
        __AdminFunctions_init(initialOwner);
    }

    /**
     * @dev Get contract version
     */
    function version() external pure returns (string memory) {
        return "3.0.0";
    }

    /**
     * @dev Receive function to accept CELO deposits
     */
    receive() external payable {
        // Allow contract to receive CELO for game funding
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Function not found");
    }

    /**
     * @dev Get comprehensive game information
     * @param requestId The game request ID
     */
    function getGameInfo(uint256 requestId) 
        external 
        view 
        returns (
            GameRequest memory gameDetails,
            uint256 randomNumber,
            uint8 coinResult,
            bool isComplete
        ) 
    {
        GameRequest memory game = gameRequests[requestId];
        return (
            game,
            game.randomNumber,
            game.coinResult,
            game.fulfilled
        );
    }
}
