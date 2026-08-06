// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    using SafeERC20 for IERC20;
    using Address for address payable;

    event Received(address indexed from, uint256 amount);
    event Withdrawn(address indexed token, address indexed to, uint256 amount);

    constructor(address owner_) Ownable(owner_) {}

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function withdraw(address token, address to, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(to).sendValue(amount);
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
        emit Withdrawn(token, to, amount);
    }

    function balanceOf(address token) external view returns (uint256) {
        return token == address(0) ? address(this).balance : IERC20(token).balanceOf(address(this));
    }
}
