// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title MockVRFCoordinator
 * @dev Mock VRF Coordinator for testing purposes
 */
contract MockVRFCoordinator is VRFCoordinatorV2Interface {
    uint256 private requestIdCounter = 1;
    mapping(uint256 => address) private requestIdToConsumer;

    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external override returns (uint256 requestId) {
        requestId = requestIdCounter++;
        requestIdToConsumer[requestId] = msg.sender;
        return requestId;
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        address consumer = requestIdToConsumer[requestId];
        require(consumer != address(0), "Invalid request ID");

        // Call the consumer's rawFulfillRandomWords function
        (bool success, ) = consumer.call(
            abi.encodeWithSignature(
                "rawFulfillRandomWords(uint256,uint256[])",
                requestId,
                randomWords
            )
        );
        require(success, "Failed to fulfill random words");
    }

    // Implement other required functions from VRFCoordinatorV2Interface
    function getRequestConfig()
        external
        pure
        override
        returns (uint16, uint32, bytes32[] memory)
    {
        bytes32[] memory keyHashes = new bytes32[](1);
        keyHashes[
            0
        ] = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        return (3, 100000, keyHashes);
    }

    function createSubscription()
        external
        pure
        override
        returns (uint64 subId)
    {
        return 1;
    }

    function getSubscription(
        uint64
    )
        external
        pure
        override
        returns (
            uint96 balance,
            uint64 reqCount,
            address owner,
            address[] memory consumers
        )
    {
        address[] memory consumerArray = new address[](0);
        return (0, 0, address(0), consumerArray);
    }

    function requestSubscriptionOwnerTransfer(
        uint64,
        address
    ) external pure override {}

    function acceptSubscriptionOwnerTransfer(uint64) external pure override {}

    function addConsumer(uint64, address) external pure override {}

    function removeConsumer(uint64, address) external pure override {}

    function cancelSubscription(uint64, address) external pure override {}

    function pendingRequestExists(
        uint64
    ) external pure override returns (bool) {
        return false;
    }
}
