// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {GovToken} from "../src/GovToken.sol";
import {Governor} from "../src/Governor.sol";
import {Treasury} from "../src/Treasury.sol";
import {TimelockController} from "@openzeppelin/contracts/governance/TimelockController.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";

contract GovernanceTest is Test {
    GovToken internal token;
    TimelockController internal timelock;
    Governor internal governor;
    Treasury internal treasury;

    uint256 internal constant MIN_DELAY = 2 days;
    uint48 internal constant VOTING_DELAY = 1 days;
    uint32 internal constant VOTING_PERIOD = 7 days;
    uint256 internal constant PROPOSAL_THRESHOLD = 100_000e18;
    uint256 internal constant QUORUM_NUMERATOR = 4;

    uint256 internal constant VOTING_POWER = 3_000_000e18;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal guardian = makeAddr("guardian");
    address internal admin = makeAddr("admin");

    address[] internal proposers;
    address[] internal executors;

    function setUp() public {
        proposers.push(address(0xdead));
        executors.push(address(0xdead));

        timelock = new TimelockController(MIN_DELAY, proposers, executors, admin);
        treasury = new Treasury(address(timelock));
        token = new GovToken(admin, address(treasury));
        governor = new Governor(
            "DAO Governor",
            token,
            timelock,
            VOTING_DELAY,
            VOTING_PERIOD,
            PROPOSAL_THRESHOLD,
            QUORUM_NUMERATOR
        );

        bytes32 proposerRole = timelock.PROPOSER_ROLE();
        bytes32 executorRole = timelock.EXECUTOR_ROLE();
        bytes32 cancellerRole = timelock.CANCELLER_ROLE();

        vm.startPrank(admin);
        timelock.grantRole(proposerRole, address(governor));
        timelock.grantRole(cancellerRole, address(governor));
        timelock.grantRole(executorRole, address(0));
        timelock.grantRole(cancellerRole, guardian);
        timelock.revokeRole(proposerRole, address(0xdead));
        timelock.revokeRole(cancellerRole, address(0xdead));
        timelock.revokeRole(timelock.DEFAULT_ADMIN_ROLE(), admin);
        token.renounceOwnership();
        vm.stopPrank();

        vm.startPrank(address(timelock));
        treasury.withdraw(address(token), address(this), 3 * VOTING_POWER);
        vm.stopPrank();

        vm.deal(address(treasury), 10e18);

        token.transfer(alice, VOTING_POWER);
        token.transfer(bob, 2 * VOTING_POWER);
        vm.prank(alice);
        token.delegate(alice);
        vm.prank(bob);
        token.delegate(bob);
        vm.roll(block.number + 1);
    }

    function _propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) internal returns (uint256) {
        vm.prank(alice);
        return governor.propose(targets, values, calldatas, description);
    }

    function _simpleProposal(string memory description) internal returns (uint256) {
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(treasury);
        values[0] = 0;
        calldatas[0] = abi.encodeCall(Treasury.withdraw, (address(0), alice, 1e18));
        return _propose(targets, values, calldatas, description);
    }

    function _fastForwardToVoting(uint256) internal {
        vm.roll(block.number + VOTING_DELAY + 1);
    }

    function _vote(uint256 proposalId, uint8 support, address voter) internal {
        vm.prank(voter);
        governor.castVote(proposalId, support);
    }

    function _voteAll(uint256 proposalId) internal {
        _vote(proposalId, 1, alice);
        _vote(proposalId, 1, bob);
    }

    function _passProposal(uint256 proposalId) internal {
        vm.roll(block.number + VOTING_DELAY + 1);
        _voteAll(proposalId);
        vm.roll(block.number + VOTING_PERIOD + 1);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Succeeded));
    }

    function _queue(uint256 proposalId) internal {
        _passProposal(proposalId);
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(treasury);
        calldatas[0] = abi.encodeCall(Treasury.withdraw, (address(0), alice, 1e18));
        vm.prank(guardian);
        governor.queue(targets, values, calldatas, keccak256(bytes("spend 1 wei")));
    }

    // ---- Deployment & roles ----

    function testDeployment() public view {
        assertEq(token.balanceOf(address(treasury)), token.MAX_SUPPLY() - 3 * VOTING_POWER);
        assertEq(token.totalSupply(), token.MAX_SUPPLY());
        assertEq(address(governor.timelock()), address(timelock));
        assertEq(governor.votingDelay(), VOTING_DELAY);
        assertEq(governor.votingPeriod(), VOTING_PERIOD);
        assertEq(governor.proposalThreshold(), PROPOSAL_THRESHOLD);
        assertEq(governor.quorumNumerator(), QUORUM_NUMERATOR);
        assertEq(token.getVotes(alice), VOTING_POWER);
        assertEq(token.getVotes(bob), 2 * VOTING_POWER);
    }

    // ---- Proposal creation ----

    function testCreateProposal() public {
        uint256 proposalId = _simpleProposal("spend 1 wei");
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Pending));
    }

    function testProposalRequiresThreshold() public {
        address charlie = makeAddr("charlie");
        vm.prank(charlie);
        vm.expectRevert(
            abi.encodeWithSelector(
                IGovernor.GovernorInsufficientProposerVotes.selector,
                charlie,
                0,
                PROPOSAL_THRESHOLD
            )
        );
        governor.propose(new address[](0), new uint256[](0), new bytes[](0), "below threshold");
    }

    function testProposerBelowThresholdFails() public {
        address carol = makeAddr("carol");
        vm.prank(bob);
        token.transfer(carol, 10e18);
        vm.prank(carol);
        token.delegate(carol);
        vm.prank(carol);
        vm.expectRevert(
            abi.encodeWithSelector(
                IGovernor.GovernorInsufficientProposerVotes.selector,
                carol,
                0,
                PROPOSAL_THRESHOLD
            )
        );
        governor.propose(new address[](0), new uint256[](0), new bytes[](0), "weak proposer");
    }

    // ---- Voting ----

    function testVoteAllSupportTypes() public {
        uint256 proposalId = _simpleProposal("spend 1 wei");
        vm.roll(block.number + VOTING_DELAY + 1);
        _vote(proposalId, 0, alice);
        _vote(proposalId, 2, bob);

        (uint256 against, uint256 forVotes, uint256 abstain) = governor.proposalVotes(proposalId);
        assertEq(against, VOTING_POWER);
        assertEq(forVotes, 0);
        assertEq(abstain, 2 * VOTING_POWER);
    }

    function testQuorumNotReached() public {
        uint256 proposalId = _simpleProposal("spend 1 wei");
        vm.roll(block.number + VOTING_DELAY + 1);
        _vote(proposalId, 1, alice);
        vm.roll(block.number + VOTING_PERIOD + 1);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Defeated));
    }

    function testVotingPeriodOverStillCounts() public {
        uint256 proposalId = _simpleProposal("spend 1 wei");
        vm.roll(block.number + VOTING_DELAY + 1);
        _voteAll(proposalId);
        vm.roll(block.number + VOTING_PERIOD + 1);
        vm.prank(alice);
        vm.expectRevert();
        governor.castVote(proposalId, 1);
    }

    // ---- Full lifecycle: propose -> vote -> queue -> execute ----

    function testFullLifecycle() public {
        uint256 proposalId = _simpleProposal("spend 1 wei");
        vm.roll(block.number + VOTING_DELAY + 1);
        _voteAll(proposalId);
        vm.roll(block.number + VOTING_PERIOD + 1);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Succeeded));

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(treasury);
        calldatas[0] = abi.encodeCall(Treasury.withdraw, (address(0), alice, 1e18));
        bytes32 descHash = keccak256(bytes("spend 1 wei"));

        vm.prank(guardian);
        governor.queue(targets, values, calldatas, descHash);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Queued));

        vm.warp(block.timestamp + MIN_DELAY);
        vm.prank(guardian);
        governor.execute(targets, values, calldatas, descHash);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Executed));
        assertEq(alice.balance, 1e18);
        assertEq(token.balanceOf(address(treasury)), token.MAX_SUPPLY() - 3 * VOTING_POWER);
    }

    // ---- Guardian cancel during timelock ----

    function testGuardianCancelsQueuedProposal() public {
        uint256 proposalId = _simpleProposal("spend 1 wei");
        vm.roll(block.number + VOTING_DELAY + 1);
        _voteAll(proposalId);
        vm.roll(block.number + VOTING_PERIOD + 1);

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(treasury);
        calldatas[0] = abi.encodeCall(Treasury.withdraw, (address(0), alice, 1e18));
        bytes32 descHash = keccak256(bytes("spend 1 wei"));

        vm.prank(guardian);
        governor.queue(targets, values, calldatas, descHash);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Queued));

        bytes32 timelockId = timelock.hashOperationBatch(
            targets,
            values,
            calldatas,
            0,
            bytes32(bytes20(address(governor))) ^ descHash
        );
        vm.prank(guardian);
        timelock.cancel(timelockId);
        assertEq(uint8(governor.state(proposalId)), uint8(IGovernor.ProposalState.Canceled));
    }

    function testNonGuardianCannotCancel() public {
        uint256 proposalId = _simpleProposal("spend 1 wei");
        vm.roll(block.number + VOTING_DELAY + 1);
        _voteAll(proposalId);
        vm.roll(block.number + VOTING_PERIOD + 1);

        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(treasury);
        calldatas[0] = abi.encodeCall(Treasury.withdraw, (address(0), alice, 1e18));
        bytes32 descHash = keccak256(bytes("spend 1 wei"));

        vm.prank(guardian);
        governor.queue(targets, values, calldatas, descHash);

        bytes32 timelockId = timelock.hashOperationBatch(
            targets,
            values,
            calldatas,
            0,
            bytes32(bytes20(address(governor))) ^ descHash
        );
        vm.prank(alice);
        vm.expectRevert();
        timelock.cancel(timelockId);
    }

    // ---- Treasury access ----

    function testOnlyTimelockCanWithdraw() public {
        vm.prank(alice);
        vm.expectRevert();
        treasury.withdraw(address(0), alice, 1e18);
    }

    function testWithdrawViaProposal() public {
        testFullLifecycle();
    }
}
