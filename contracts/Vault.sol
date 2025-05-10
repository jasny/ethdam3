// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Router} from "@hyperlane-xyz/core/contracts/client/Router.sol";

contract Vault is Router {
    uint256 public constant HANDLE_GAS_AMOUNT = 50_000;

    struct Heir {
        address heir;
        uint256 points;
    }

    struct InheritTable {
        Heir[] heirs;
        uint256 points;
        bool available;
    }

    event WillReceived(address indexed creator, bool available);
    event RawMessageReceived(bytes message);

    mapping(address => uint256) public ethBalances;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(address => InheritTable) private _tables;
    uint32 public immutable testamentDomain;

    constructor(address _mailbox, uint32 _testamentDomain, address _remoteRouter) Router(_mailbox) {
        _transferOwnership(msg.sender);
        setHook(address(0));

        testamentDomain = _testamentDomain;

        _enrollRemoteRouter(_testamentDomain, bytes32(uint256(uint160(_remoteRouter))));
    }

    // Deposit ETH into the vault
    receive() external payable {
        ethBalances[msg.sender] += msg.value;
    }

    // Deposit ETH into the vault
    function depositToken(address token, uint256 amount) external {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        tokenBalances[msg.sender][token] += amount;
    }

    // Calculate the fee for sending a request to the Testament
    function quoteRequestWill(address creator) external view returns (uint256) {
        return _quoteDispatch(testamentDomain, abi.encode(creator));
    }

    // Request a will from the Testament router
    function requestWill(address creator) external payable {
        bytes memory msgBody = abi.encode(creator);
        _dispatch(testamentDomain, msgBody);
    }

    // Receive a will from the Testament router
    function _handle(uint32, bytes32, bytes calldata message) internal override {
        emit RawMessageReceived(message);

        /*
        (address creator, Heir[] memory heirs, uint256 totalPoints, string memory status) =
                            abi.decode(message, (address, Heir[], uint256, string));

        bool available = (keccak256(bytes(status)) == keccak256("ok"));

        if (!available) {
            emit WillReceived(creator, false);
            return;
        }

        InheritTable storage table = _tables[creator];
        delete table.heirs;
        table.points = totalPoints;
        table.available = true;

        for (uint i = 0; i < heirs.length; ++i) {
            table.heirs.push(heirs[i]);
        }

        emit WillReceived(creator, true);*/
    }

    // Distribute ETH to heirs
    // @dev This function should be called after the will is revealed
    function distributeETH(address creator) external {
        require(ethBalances[creator] > 0, "Already claimed");

        InheritTable storage table = _tables[creator];
        require(table.available, "Will not yet available");

        uint256 total = ethBalances[creator];
        ethBalances[creator] = 0;

        for (uint256 i = 0; i < table.heirs.length; ++i) {
            uint256 amount = (total * table.heirs[i].points) / table.points;
            payable(table.heirs[i].heir).transfer(amount);
        }
    }

    // Distribute ERC20 to heirs
    // @dev This function should be called after the will is revealed
    function distributeToken(address creator, address token) external {
        require(tokenBalances[creator][token] > 0, "Already claimed");

        InheritTable storage table = _tables[creator];
        require(table.available, "Will not yet available");

        uint256 total = tokenBalances[creator][token];
        tokenBalances[creator][token] = 0;

        for (uint256 i = 0; i < table.heirs.length; ++i) {
            uint256 amount = (total * table.heirs[i].points) / table.points;
            require(IERC20(token).transfer(table.heirs[i].heir, amount), "Transfer failed");
        }
    }

    // Don't allow the owner to enroll a remote router, this is done in the constructor
    function enrollRemoteRouter(
        uint32, /* _domain */
        bytes32 /* _router */
    ) public pure override {
        revert("Vault: enrollRemoteRouter is disabled");
    }
}
