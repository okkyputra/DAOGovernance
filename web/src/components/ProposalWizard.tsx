"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useWriteContract } from "wagmi";
import { useVotingPower } from "@/hooks/useGovToken";
import { governorAbi } from "@/lib/abis";
import { config, isZeroAddress } from "@/lib/config";
import { buildProposal, describeAction, type ProposalAction } from "@/lib/proposal";
import { formatUnitsRaw } from "@/lib/format";
import { pinToIpfs } from "@/lib/api";

const governorAddress = config.governorAddress as `0x${string}`;

type Step = 1 | 2 | 3 | 4;

interface ActionForm {
  kind: ProposalAction["kind"];
  token: string;
  to: string;
  amount: string;
  target: string;
  calldata: string;
  value: string;
  text: string;
}

const emptyAction = (kind: ProposalAction["kind"]): ActionForm => ({
  kind,
  token: "",
  to: "",
  amount: "",
  target: "",
  calldata: "",
  value: "0",
  text: "",
});

function toProposalAction(a: ActionForm): ProposalAction {
  if (a.kind === "signal") return { kind: "signal", text: a.text };
  if (a.kind === "contract-call") return { kind: "contract-call", target: a.target, calldata: a.calldata, value: a.value };
  return { kind: "treasury-transfer", token: a.token, to: a.to, amount: a.amount };
}

export function ProposalWizard() {
  const { isConnected } = useAccount();
  const { data: votingPower } = useVotingPower();
  const [step, setStep] = useState<Step>(1);

  const [actionType, setActionType] = useState<ProposalAction["kind"]>("treasury-transfer");
  const [action, setAction] = useState<ActionForm>(emptyAction("treasury-transfer"));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pinState, setPinState] = useState<"idle" | "pinning" | "pinned" | "failed">("idle");

  const { writeContract, isPending } = useWriteContract();

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
        Connect a wallet to create a proposal.
      </div>
    );
  }

  const canPropose = votingPower !== undefined && Number(votingPower) > 0n;

  const submit = async () => {
    setError(null);
    if (isZeroAddress(config.governorAddress)) {
      setError("Governor address not configured.");
      return;
    }
    const { targets, values, calldatas } = buildProposal(toProposalAction(action));
    let desc = `# ${title}\n\n${description}`;

    setPinState("pinning");
    const pinned = await pinToIpfs(desc);
    if (pinned.cid) {
      desc = `# ${title}\n\n${description}\n\n---\nIPFS: ${pinned.gatewayUrl ?? pinned.cid}`;
      setPinState("pinned");
    } else {
      setPinState("failed");
      console.warn("IPFS pin failed (continuing without CID):", pinned.error);
    }

    writeContract(
      {
        abi: governorAbi,
        address: governorAddress,
        functionName: "propose",
        args: [targets, values, calldatas, desc],
      },
      {
        onSuccess: (hash) => setTxHash(hash),
        onError: (err) => {
          setError(err.message);
          setPinState("idle");
        },
      }
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Steps current={step} />

        {step === 1 && (
          <StepActionType
            actionType={actionType}
            onSelect={(t) => {
              setActionType(t);
              setAction(emptyAction(t));
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <StepAction actionType={actionType} action={action} onChange={setAction} onNext={() => setStep(3)} />
        )}

        {step === 3 && (
          <StepDescription
            title={title}
            description={description}
            onTitle={setTitle}
            onDescription={setDescription}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepReview
            action={toProposalAction(action)}
            title={title}
            description={description}
            canPropose={canPropose}
            onBack={() => setStep(3)}
            onSubmit={submit}
            isPending={isPending}
            error={error}
            txHash={txHash}
            pinState={pinState}
          />
        )}
      </div>

      <aside className="h-fit rounded-lg border border-slate-800 bg-slate-900 p-5 lg:sticky lg:top-24">
        <p className="text-sm text-slate-400">Your voting power</p>
        <p className="mt-1 text-2xl font-semibold text-white">{formatUnitsRaw(votingPower)}</p>
        <p className="mt-3 text-xs text-slate-500">
          You must hold at least the proposal threshold to submit. Voting power is snapshotted at submission.
        </p>
      </aside>
    </div>
  );
}

function Steps({ current }: { current: Step }) {
  const labels = ["Action", "Details", "Description", "Review"];
  return (
    <ol className="flex items-center gap-2 text-xs text-slate-500">
      {labels.map((l, i) => {
        const n = (i + 1) as Step;
        const active = n === current;
        const done = n < current;
        return (
          <li key={l} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium ${
                active
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                  : done
                    ? "border-emerald-500/40 text-emerald-500"
                    : "border-slate-700 text-slate-500"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span className={active ? "text-white" : ""}>{l}</span>
            {i < labels.length - 1 && <span className="w-4 border-t border-slate-700" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepActionType({
  actionType,
  onSelect,
}: {
  actionType: string;
  onSelect: (t: ProposalAction["kind"]) => void;
}) {
  const options: { kind: ProposalAction["kind"]; label: string; desc: string }[] = [
    { kind: "treasury-transfer", label: "Treasury transfer", desc: "Move ETH or tokens out of the treasury" },
    { kind: "contract-call", label: "Contract call", desc: "Call any contract with raw calldata" },
    { kind: "signal", label: "Signal-only", desc: "Text proposal, no on-chain execution" },
  ];
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <button
          key={o.kind}
          onClick={() => onSelect(o.kind)}
          className={`w-full rounded-lg border p-4 text-left transition-colors ${
            actionType === o.kind
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-slate-800 bg-slate-900 hover:border-slate-600"
          }`}
        >
          <p className="text-sm font-semibold text-white">{o.label}</p>
          <p className="mt-1 text-xs text-slate-400">{o.desc}</p>
        </button>
      ))}
    </div>
  );
}

function StepAction({
  actionType,
  action,
  onChange,
  onNext,
}: {
  actionType: string;
  action: ActionForm;
  onChange: (a: ActionForm) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300">Proposal action</h2>

      {actionType === "treasury-transfer" && (
        <>
          <Field label="Token address (0x0 = ETH)">
            <input
              value={action.kind === "treasury-transfer" ? action.token : ""}
              onChange={(e) => onChange({ ...action, token: e.target.value })}
              placeholder="0x0000…0000 for ETH"
              className={inputCls}
            />
          </Field>
          <Field label="Recipient">
            <input
              value={action.kind === "treasury-transfer" ? action.to : ""}
              onChange={(e) => onChange({ ...action, to: e.target.value })}
              placeholder="0x…"
              className={inputCls}
            />
          </Field>
          <Field label="Amount (raw units, 18 decimals)">
            <input
              value={action.kind === "treasury-transfer" ? action.amount : ""}
              onChange={(e) => onChange({ ...action, amount: e.target.value })}
              placeholder="1000000000000000000 = 1 token"
              className={inputCls}
            />
          </Field>
        </>
      )}

      {actionType === "contract-call" && (
        <>
          <Field label="Target contract">
            <input
              value={action.kind === "contract-call" ? action.target : ""}
              onChange={(e) => onChange({ ...action, target: e.target.value })}
              placeholder="0x…"
              className={inputCls}
            />
          </Field>
          <Field label="Value (wei)">
            <input
              value={action.kind === "contract-call" ? action.value : ""}
              onChange={(e) => onChange({ ...action, value: e.target.value })}
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Calldata (hex)">
            <textarea
              value={action.kind === "contract-call" ? action.calldata : ""}
              onChange={(e) => onChange({ ...action, calldata: e.target.value })}
              placeholder="0x…"
              rows={4}
              className={inputCls}
            />
          </Field>
        </>
      )}

      {actionType === "signal" && (
        <Field label="Summary">
          <textarea
            value={action.kind === "signal" ? action.text : ""}
            onChange={(e) => onChange({ ...action, text: e.target.value })}
            placeholder="What does this proposal signal?"
            rows={4}
            className={inputCls}
          />
        </Field>
      )}

      <button onClick={onNext} className={primaryBtnCls}>
        Continue
      </button>
    </div>
  );
}

function StepDescription({
  title,
  description,
  onTitle,
  onDescription,
  onNext,
  onBack,
}: {
  title: string;
  description: string;
  onTitle: (t: string) => void;
  onDescription: (d: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300">Title & description</h2>
      <Field label="Title">
        <input value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Short title" className={inputCls} />
      </Field>
      <Field label="Description (markdown)">
        <textarea
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          rows={8}
          placeholder="Rationale, details, links…"
          className={inputCls}
        />
      </Field>
      <div className="flex gap-2">
        <button onClick={onBack} className={ghostBtnCls}>
          Back
        </button>
        <button onClick={onNext} className={primaryBtnCls}>
          Review
        </button>
      </div>
    </div>
  );
}

function StepReview({
  action,
  title,
  description,
  canPropose,
  onBack,
  onSubmit,
  isPending,
  error,
  txHash,
  pinState,
}: {
  action: ProposalAction;
  title: string;
  description: string;
  canPropose: boolean;
  onBack: () => void;
  onSubmit: () => void;
  isPending: boolean;
  error: string | null;
  txHash: string | null;
  pinState: "idle" | "pinning" | "pinned" | "failed";
}) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300">Review & submit</h2>
      <div className="space-y-1 text-sm">
        <p className="font-semibold text-white">{title || "(untitled)"}</p>
        <p className="text-slate-400">{describeAction(action)}</p>
        {description && <p className="whitespace-pre-wrap text-xs text-slate-500">{description.slice(0, 200)}{description.length > 200 ? "…" : ""}</p>}
      </div>

      {!canPropose && (
        <p className="text-xs text-amber-400">
          Your voting power is 0 — you may not meet the proposal threshold.
        </p>
      )}

      {pinState === "pinning" && <p className="text-xs text-slate-500">Pinning description to IPFS…</p>}
      {pinState === "pinned" && <p className="text-xs text-emerald-400">Description pinned to IPFS — CID will be embedded in the proposal.</p>}
      {pinState === "failed" && <p className="text-xs text-amber-400">IPFS pin failed — submitting without CID.</p>}

      {error && <p className="text-xs text-red-400">{error}</p>}
      {txHash && (
        <p className="text-xs text-emerald-400">
          Proposal submitted — tx {txHash.slice(0, 10)}… Track it in your wallet.
        </p>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} className={ghostBtnCls}>
          Back
        </button>
        <button onClick={onSubmit} disabled={isPending || pinState === "pinning"} className={primaryBtnCls}>
          {pinState === "pinning" ? "Pinning…" : isPending ? "Submitting…" : "Submit proposal"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-emerald-500";
const primaryBtnCls =
  "rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50";
const ghostBtnCls =
  "rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-400">{label}</span>
      {children}
    </label>
  );
}
