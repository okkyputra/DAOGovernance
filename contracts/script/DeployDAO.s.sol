// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {GovToken} from "../src/GovToken.sol";
import {Governor} from "../src/Governor.sol";
import {Treasury} from "../src/Treasury.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract DeployDAO is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        uint256 minDelay = vm.envOr("MIN_DELAY", uint256(2 days));
        uint48 votingDelay = uint48(vm.envOr("VOTING_DELAY", uint256(1 days)));
        uint32 votingPeriod = uint32(vm.envOr("VOTING_PERIOD", uint256(7 days)));
        uint256 proposalThreshold = vm.envOr("PROPOSAL_THRESHOLD", uint256(100_000e18));
        uint256 quorumNumerator = vm.envOr("QUORUM_NUMERATOR", uint256(4));
        address guardian = vm.envOr("GUARDIAN", deployer);

        vm.startBroadcast(deployerKey);

        address[] memory proposers = new address[](1);
        proposers[0] = deployer;
        address[] memory executors = new address[](1);
        executors[0] = address(0);

        TimelockController timelock = new TimelockController(minDelay, proposers, executors, deployer);
        Treasury treasury = new Treasury(address(timelock));
        GovToken token = new GovToken(deployer, address(treasury));
        Governor governor = new Governor(
            "DAO Governor",
            IVotes(address(token)),
            timelock,
            votingDelay,
            votingPeriod,
            proposalThreshold,
            quorumNumerator
        );

        timelock.grantRole(timelock.PROPOSER_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), address(governor));
        timelock.grantRole(timelock.CANCELLER_ROLE(), guardian);
        timelock.revokeRole(timelock.PROPOSER_ROLE(), deployer);
        timelock.revokeRole(timelock.CANCELLER_ROLE(), deployer);
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), deployer);
        token.renounceOwnership();

        vm.stopBroadcast();

        console2.log("Timelock:  ", address(timelock));
        console2.log("Treasury:  ", address(treasury));
        console2.log("GovToken:  ", address(token));
        console2.log("Governor:  ", address(governor));
        console2.log("Guardian:  ", guardian);
    }
}
