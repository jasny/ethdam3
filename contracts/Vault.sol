// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Testament.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Vault {
    address public immutable testament;

    mapping(address => uint256) public ethBalances;
    mapping(address => mapping(address => uint256)) public tokenBalances;
    mapping(address => bool) public claimed;

    constructor(address _testament) {
        testament = _testament;
    }

    receive() external payable {
        ethBalances[msg.sender] += msg.value;
    }

    function depositToken(address token, uint256 amount) external {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        tokenBalances[msg.sender][token] += amount;
    }

    function distributeETH(address creator) external {
        require(!claimed[creator], "Already claimed");
        require(_isExpired(creator), "Will not yet available");

        (address[] memory heirs, uint256[] memory shares) = _getParsedWill(creator);
        uint256 total = ethBalances[creator];
        claimed[creator] = true;
        ethBalances[creator] = 0;

        for (uint256 i = 0; i < heirs.length; ++i) {
            uint256 amount = (total * shares[i]) / 10000;
            payable(heirs[i]).transfer(amount);
        }
    }

    function distributeToken(address creator, address token) external {
        require(!claimed[creator], "Already claimed");
        require(_isExpired(creator), "Will not yet available");

        (address[] memory heirs, uint256[] memory shares) = _getParsedWill(creator);
        uint256 total = tokenBalances[creator][token];
        claimed[creator] = true;
        tokenBalances[creator][token] = 0;

        for (uint256 i = 0; i < heirs.length; ++i) {
            uint256 amount = (total * shares[i]) / 10000;
            require(IERC20(token).transfer(heirs[i], amount), "Transfer failed");
        }
    }

    function _isExpired(address creator) internal view returns (bool) {
        uint256 lastSeen = Testament(testament)._lastSeen(creator);
        uint256 longevity = Testament(testament)._metas(creator);
        return block.timestamp >= lastSeen + longevity;
    }

    function _getParsedWill(address creator) internal view returns (address[] memory heirs, uint256[] memory shares) {
        (Testament.Heir[] memory rawHeirs, uint256 totalPoints) = Testament(testament).revealWill(creator);
        uint256 count = rawHeirs.length;
        heirs = new address[](count);
        shares = new uint256[](count);

        for (uint256 i = 0; i < count; ++i) {
            heirs[i] = rawHeirs[i].heir;
            shares[i] = (rawHeirs[i].points * 10000) / totalPoints;
        }
    }
}
