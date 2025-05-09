// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Testament {
    struct InheritMetadata {
        /// @notice How long (in seconds) the secret should remain so past the creator's last update.
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

    event WillCreated(
        address indexed creator
    );

    event Seen(
        address indexed creator
    );

    mapping(address => InheritMetadata) public _metas;
    mapping(address => InheritTable) private _tables;
    /// @dev The unix timestamp at which the address was last seen.
    mapping(address => uint256) public _lastSeen;

    function createWill(
        Heir[] memory heirs,
        uint256 longevity
    ) external {
        _updateLastSeen();
        _metas[msg.sender] = InheritMetadata({
            longevity: longevity
        });

        uint256 points = 0;
        for (uint256 i = 0; i < heirs.length; ++i) {
            points += heirs[i].points;
        }

        InheritTable storage table = _tables[msg.sender];
        table.points = points;

        delete table.heirs; // clear any existing entries first
        for (uint256 i = 0; i < heirs.length; ++i) {
            table.heirs.push(heirs[i]);
        }

        emit WillCreated(msg.sender);
    }

    /// Reveal the will at the specified index.
    function revealWill(address creator) external view returns (Heir[] memory, uint256) {
        InheritMetadata memory meta = _metas[creator];
        require(meta.longevity > 0, "Will not found");

        uint256 expiry = _lastSeen[creator] + meta.longevity;
        require(block.timestamp >= expiry, "Will not yet available");

        InheritTable storage table = _tables[creator];
        return (table.heirs, table.points);
    }

    /// Return the time (in seconds since the epoch) at which the owner was last seen, or zero if never seen.
    function getLastSeen(address owner) external view returns (uint256) {
        return _lastSeen[owner];
    }

    // This function is called by the owner of the will to update their last seen time.
    function ping() external {
        _updateLastSeen();
    }

    function _updateLastSeen() internal {
        _lastSeen[msg.sender] = block.timestamp;
        emit Seen(msg.sender);
    }
}
