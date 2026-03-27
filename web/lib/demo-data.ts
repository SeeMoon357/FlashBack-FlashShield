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
    address: "0xA7f2...91cD",
    network: "Base Sepolia",
    strategyId: "FS-001",
    approved: "Prepared",
  },
  timeline: [
    {
      label: "Block 1",
      price: "$100.00",
      riskScore: 18,
      stage: "Safe",
      note: "Position opened and monitored.",
    },
    {
      label: "Block 2",
      price: "$92.00",
      riskScore: 44,
      stage: "Watch",
      note: "Price drift detected.",
    },
    {
      label: "Block 3",
      price: "$84.00",
      riskScore: 71,
      stage: "NearLiquidation",
      note: "Reactive subscription is armed.",
    },
    {
      label: "Block 4",
      price: "$72.00",
      riskScore: 92,
      stage: "Triggered",
      note: "Protection has executed on B chain.",
    },
  ],
  callback: {
    status: "Executed",
    originChain: "Ethereum Sepolia",
    destinationChain: "Base Sepolia",
    callbackProxy: "Verified",
    rvmId: "RVM-18",
    txHash: "0x4c1b...9f2a",
    latency: "26s",
  },
  results: {
    unprotected: {
      title: "Unprotected",
      subtitle: "No risk cut on destination chain.",
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
      subtitle: "80% shifted to the stable side.",
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
