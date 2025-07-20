// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "./HeadsUpStorage.sol";

abstract contract AdminFunctions is
    HeadsUpStorage,
    OwnableUpgradeable,
    PausableUpgradeable
{
    function __AdminFunctions_init(
        address initialOwner
    ) internal onlyInitializing {
        __Ownable_init(initialOwner);
        __Pausable_init();
    }

    /**
     * @dev Withdraw platform fees
     */
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= platformFees, "Amount exceeds available fees");
        require(amount > 0, "Amount must be greater than 0");

        platformFees -= amount;
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(owner(), amount);
    }

    /**
     * @dev Withdraw all platform fees
     */
    function withdrawAllFunds() external onlyOwner {
        uint256 amount = platformFees;
        require(amount > 0, "No funds to withdraw");

        platformFees = 0;
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(owner(), amount);
    }

    /**
     * @dev Transfer funds to specific address
     */
    function transferFunds(
        address payable recipient,
        uint256 amount
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(amount <= platformFees, "Amount exceeds available fees");
        require(amount > 0, "Amount must be greater than 0");

        platformFees -= amount;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(recipient, amount);
    }

    /**
     * @dev Update betting limits
     */
    function updateBetLimits(
        uint256 newMinBet,
        uint256 newMaxBet
    ) external onlyOwner {
        require(newMinBet > 0, "Min bet must be greater than 0");
        require(newMaxBet > newMinBet, "Max bet must be greater than min bet");

        minBetAmount = newMinBet;
        maxBetAmount = newMaxBet;

        emit BetLimitsUpdated(newMinBet, newMaxBet);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get current bet limits
     */
    function getBetLimits() external view returns (uint256 min, uint256 max) {
        return (minBetAmount, maxBetAmount);
    }

    /**
     * @dev Emergency function to fund contract for game payouts
     */
    function fundContract() external payable onlyOwner {
        require(msg.value > 0, "Must send some funds");
        // Funds are automatically added to contract balance
    }
}
