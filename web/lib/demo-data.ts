import { contractConfig } from "@/lib/contracts";

export type TimelinePoint = {
  label: string;
  price: string;
  riskScore: number;
  stage: "Safe" | "Watch" | "NearLiquidation" | "Triggered";
  note: string;
};

export type CallbackSnapshot = {
  status: "Listening" | "Triggered" | "Verified" | "Executed";
  originChain: string;
  destinationChain: string;
  callbackProxy: string;
  rvmId: string;
  txHash: string;
  latency: string;
};

export type ResultCard = {
  title: string;
  subtitle: string;
  balanceLabel: string;
  balanceValue: string;
  retainedLabel: string;
  retainedValue: string;
  drawdownLabel: string;
  drawdownValue: string;
  accent: "amber" | "emerald";
};

export type DemoSnapshot = {
  wallet: {
    connected: boolean;
    label: string;
    address: string;
    network: string;
    strategyId: string;
    approved: string;
  };
  timeline: TimelinePoint[];
  callback: CallbackSnapshot;
  results: {
    unprotected: ResultCard;
    protected: ResultCard;
  };
};

export const demoSnapshot: DemoSnapshot = {
  wallet: {
    connected: false,
    label: "Connect wallet",
    address: "0x4137...5dd6",
    network: "Base Sepolia",
    strategyId: "FS-007",
    approved: "Executor funded and armed",
  },
  timeline: [
    {
      label: "Step 1",
      price: "$100.00",
      riskScore: 18,
      stage: "Safe",
      note: "Position opened on Ethereum Sepolia.",
    },
    {
      label: "Step 2",
      price: "$96.00",
      riskScore: 39,
      stage: "Watch",
      note: "Price softens but remains outside the warning zone.",
    },
    {
      label: "Step 3",
      price: "$92.00",
      riskScore: 74,
      stage: "NearLiquidation",
      note: "NearLiquidation emitted and matched by Reactive.",
    },
    {
      label: "Step 4",
      price: "$92.00",
      riskScore: 92,
      stage: "Triggered",
      note: "Base Sepolia executor received callback and protected 80%.",
    },
  ],
  callback: {
    status: "Executed",
    originChain: `Ethereum Sepolia (${contractConfig.originChainId})`,
    destinationChain: `Base Sepolia (${contractConfig.destinationChainId})`,
    callbackProxy: "0xa6eA...A5a6 verified",
    rvmId: "0x413716245425E7f9Ce59771Ba048F1f3DD675dd6",
    txHash: "0x92c85b51...fe69872f",
    latency: "~10-20s observed",
  },
  results: {
    unprotected: {
      title: "Unprotected",
      subtitle: "No destination-chain hedge applied.",
      balanceLabel: "Risk balance",
      balanceValue: "100%",
      retainedLabel: "Value retained",
      retainedValue: "81.5%",
      drawdownLabel: "Drawdown",
      drawdownValue: "-18.5%",
      accent: "amber",
    },
    protected: {
      title: "Protected",
      subtitle: "80% shifted to the stable side on Base Sepolia.",
      balanceLabel: "Risk balance",
      balanceValue: "20%",
      retainedLabel: "Value retained",
      retainedValue: "93.8%",
      drawdownLabel: "Drawdown",
      drawdownValue: "-6.2%",
      accent: "emerald",
    },
  },
};
