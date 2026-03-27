// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal Reactive-compatible base types for local compilation.
interface IReactive {
    struct LogRecord {
        uint256 chain_id;
        address _contract;
        uint256 topic_0;
        uint256 topic_1;
        uint256 topic_2;
        uint256 topic_3;
        bytes data;
        uint256 block_number;
        uint256 op_code;
        uint256 block_hash;
        uint256 tx_hash;
        uint256 log_index;
    }

    function react(LogRecord calldata log) external;
}

interface ISubscriptionService {
    function subscribe(
        uint256 chain_id,
        address _contract,
        uint256 topic_0,
        uint256 topic_1,
        uint256 topic_2,
        uint256 topic_3
    ) external;
}

interface ICallbackTarget {
    function onReactiveCallback(
        address rvmId,
        bytes32 strategyId,
        uint256 triggerPrice,
        uint8 action
    ) external;
}

abstract contract ReactiveBase is IReactive {
    address internal constant SERVICE_ADDR =
        0x0000000000000000000000000000000000fffFfF;

    ISubscriptionService internal constant service =
        ISubscriptionService(SERVICE_ADDR);

    modifier serviceOnly() {
        require(msg.sender == SERVICE_ADDR, "Service only");
        _;
    }

    /// @notice Hardhat local tests do not provide the Reactive system contract.
    function _serviceAvailable() internal view returns (bool) {
        return SERVICE_ADDR.code.length > 0;
    }
}
