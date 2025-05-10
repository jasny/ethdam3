// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Router } from "@hyperlane-xyz/core/contracts/client/Router.sol";

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

    mapping(address => uint256) public ethBalances;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(address => InheritTable) private _tables;
    mapping(address => address[]) private _tokensDeposited;
    uint32 public immutable testamentDomain;

    constructor(address _mailbox, uint32 _testamentDomain, address _testamentAddr) Router(_mailbox) {
        _transferOwnership(msg.sender);
        setHook(address(0));

        testamentDomain = _testamentDomain;
        _enrollRemoteRouter(_testamentDomain, bytes32(uint256(uint160(_testamentAddr))));
    }

    // Deposit ETH into the vault
    receive() external payable {
        ethBalances[msg.sender] += msg.value;
    }

    // Deposit ETH into the vault
    function depositToken(address token, uint256 amount) external {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        if (tokenBalances[msg.sender][token] == 0) {
            _tokensDeposited[msg.sender].push(token);
        }
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

    // Handle the incoming reply from the Testament
    function _handle(uint32, bytes32, bytes calldata message) internal override {
        (address creator, Heir[] memory heirs, uint256 totalPoints) =
                            abi.decode(message, (address, Heir[], uint256));

        bool available = totalPoints > 0;

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

        emit WillReceived(creator, true);
    }

    // Distribute the assets to the heirs
    function distribute(address creator) external {
        InheritTable storage table = _tables[creator];
        require(table.available, "Will not yet available");

        // Distribute ETH
        uint256 ethTotal = ethBalances[creator];
        ethBalances[creator] = 0;
        if (ethTotal > 0) {
            for (uint256 i = 0; i < table.heirs.length; ++i) {
                uint256 amount = (ethTotal * table.heirs[i].points) / table.points;
                payable(table.heirs[i].heir).transfer(amount);
            }
        }

        // Distribute ERC20 tokens
        address[] storage tokens = _tokensDeposited[creator];
        for (uint256 t = 0; t < tokens.length; ++t) {
            address token = tokens[t];
            uint256 tokenTotal = tokenBalances[creator][token];
            if (tokenTotal > 0) {
                tokenBalances[creator][token] = 0;
                for (uint256 i = 0; i < table.heirs.length; ++i) {
                    uint256 amount = (tokenTotal * table.heirs[i].points) / table.points;
                    require(IERC20(token).transfer(table.heirs[i].heir, amount), "Transfer failed");
                }
            }
        }

        // Clean up token list
        delete _tokensDeposited[creator];
    }

    // Get a list of ETH and ERC20 token balances
    function getBalance(address creator) external view returns (uint256 eth, address[] memory tokens, uint256[] memory amounts) {
        InheritTable storage table = _tables[creator];
        require(table.available, "Will not yet available");

        eth = ethBalances[creator];
        tokens = _tokensDeposited[creator];
        amounts = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; ++i) {
            amounts[i] = tokenBalances[creator][tokens[i]];
        }
    }

    // Disable the enrollRemoteRouter function
    function enrollRemoteRouter(
        uint32,
        bytes32
    ) public pure override {
        revert("Vault: enrollRemoteRouter is disabled");
    }
}
