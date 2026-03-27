export type ContractConfig = {
  originChainId: number;
  destinationChainId: number;
  positionRiskSimulatorAddress: string;
  protectionExecutorAddress: string;
  reactiveProtectionAddress: string;
};

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const contractConfig: ContractConfig = {
  originChainId: parseNumber(process.env.NEXT_PUBLIC_ORIGIN_CHAIN_ID, 11155111),
  destinationChainId: parseNumber(process.env.NEXT_PUBLIC_DESTINATION_CHAIN_ID, 84532),
  positionRiskSimulatorAddress:
    process.env.NEXT_PUBLIC_POSITION_RISK_SIMULATOR_ADDRESS || "0x0000000000000000000000000000000000000000",
  protectionExecutorAddress:
    process.env.NEXT_PUBLIC_PROTECTION_EXECUTOR_ADDRESS || "0x0000000000000000000000000000000000000000",
  reactiveProtectionAddress:
    process.env.NEXT_PUBLIC_REACTIVE_PROTECTION_ADDRESS || "0x0000000000000000000000000000000000000000",
};

