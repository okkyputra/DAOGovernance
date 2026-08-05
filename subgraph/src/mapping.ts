import { BigInt } from "@graphprotocol/graph-ts";
import {
  ProposalCreated,
  VoteCast,
  ProposalCanceled,
  ProposalQueued,
  ProposalExecuted,
} from "../generated/Governor/Governor";
import { Proposal, Vote } from "../generated/schema";

function loadProposal(id: BigInt): Proposal {
  let proposal = Proposal.load(id.toString());
  if (proposal == null) {
    proposal = new Proposal(id.toString());
    proposal.votesFor = BigInt.fromI32(0);
    proposal.votesAgainst = BigInt.fromI32(0);
    proposal.votesAbstain = BigInt.fromI32(0);
  }
  return proposal;
}

export function handleProposalCreated(event: ProposalCreated): void {
  let proposal = loadProposal(event.params.proposalId);
  proposal.proposer = event.params.proposer;
  proposal.startBlock = event.params.startBlock;
  proposal.endBlock = event.params.endBlock;
  proposal.state = "Pending";
  proposal.createdAt = event.block.timestamp;
  proposal.description = event.params.description;
  proposal.save();
}

export function handleVoteCast(event: VoteCast): void {
  let proposal = loadProposal(event.params.proposalId);
  let vote = new Vote(
    `${event.params.proposalId.toString()}-${event.params.voter.toHex()}-${event.logIndex.toString()}`
  );
  vote.proposal = proposal.id;
  vote.voter = event.params.voter;
  vote.support = event.params.support;
  vote.weight = event.params.weight;
  vote.reason = event.params.reason;
  vote.save();

  if (event.params.support == 1) {
    proposal.votesFor = proposal.votesFor.plus(event.params.weight);
  } else if (event.params.support == 0) {
    proposal.votesAgainst = proposal.votesAgainst.plus(event.params.weight);
  } else {
    proposal.votesAbstain = proposal.votesAbstain.plus(event.params.weight);
  }
  proposal.save();
}

export function handleProposalCanceled(event: ProposalCanceled): void {
  let proposal = loadProposal(event.params.proposalId);
  proposal.state = "Canceled";
  proposal.save();
}

export function handleProposalQueued(event: ProposalQueued): void {
  let proposal = loadProposal(event.params.proposalId);
  proposal.state = "Queued";
  proposal.save();
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  let proposal = loadProposal(event.params.proposalId);
  proposal.state = "Executed";
  proposal.save();
}
