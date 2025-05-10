// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@hyperlane-xyz/core/contracts/client/Router.sol";

contract Testament is Router {
    struct InheritMetadata {
        uint256 longevity;
    }

    struct Heir {
        address heir;
        uint256 points;
    }

    struct InheritTable {
        Heir[] heirs;
        uint256 points;
    }

    event WillCreated(address indexed creator);
    event Seen(address indexed creator);

    mapping(address => InheritMetadata) public _metas;
    mapping(address => InheritTable) private _tables;
    mapping(address => uint256) public _lastSeen;
    mapping(address => string) private _willMessages;

    constructor(address _mailbox) Router(_mailbox) {
        _transferOwnership(msg.sender);
        setHook(address(0));
    }

    function createWill(
        string calldata willMessage,
        Heir[] memory heirs,
        uint256 longevity
    ) external {
        _updateLastSeen(msg.sender);
        _metas[msg.sender] = InheritMetadata({ longevity: longevity });
        _willMessages[msg.sender] = willMessage;

        uint256 points = 0;
        for (uint256 i = 0; i < heirs.length; ++i) {
            points += heirs[i].points;
        }

        InheritTable storage table = _tables[msg.sender];
        table.points = points;

        delete table.heirs;
        for (uint256 i = 0; i < heirs.length; ++i) {
            table.heirs.push(heirs[i]);
        }

        emit WillCreated(msg.sender);
    }

    function revealWill(address creator) external view returns (Heir[] memory, uint256, string memory) {
        InheritMetadata memory meta = _metas[creator];
        require(meta.longevity > 0, "Will not found");

        uint256 expiry = _lastSeen[creator] + meta.longevity;
        require(block.timestamp >= expiry, "Will not yet available");

        InheritTable storage table = _tables[creator];
        return (table.heirs, table.points, _willMessages[creator]);
    }

    function getLastSeen(address owner) external view returns (uint256) {
        return _lastSeen[owner];
    }

    function getExpiry(address owner) external view returns (uint256) {
        InheritMetadata memory meta = _metas[owner];
        require(meta.longevity > 0, "Will not found");
        return _lastSeen[owner] + meta.longevity;
    }

    function ping() external {
        _updateLastSeen(msg.sender);
    }

    function _updateLastSeen(address creator) internal {
        _lastSeen[creator] = block.timestamp;
        emit Seen(creator);
    }

    // Handle incoming request from Vault (on remote chain)
    function _handle(uint32 origin, bytes32, bytes calldata message) internal override {
        address creator = abi.decode(message, (address));
        InheritMetadata memory meta = _metas[creator];
        Heir[] memory empty;

        bytes memory reply;
        bool available = (meta.longevity > 0 && block.timestamp >= _lastSeen[creator] + meta.longevity);

        if (!available) {
            reply = abi.encode(creator, empty, 0);
        } else {
            InheritTable storage table = _tables[creator];
            reply = abi.encode(creator, table.heirs, table.points);
        }

        _dispatch(origin, reply);
    }
}
