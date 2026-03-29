/**
 * 睿应层（Reactive Layer）演示配置：部署地址与全流程交易哈希通过 Vite 环境变量注入，
 * 便于 README 要求中的「公开合约地址 + 完整 tx 记录」与大屏展示一致。
 */
function env(key: string): string | undefined {
  const raw = (import.meta.env as Record<string, string | undefined>)[key]
  if (typeof raw !== "string") return undefined
  const v = raw.trim()
  return v.length ? v : undefined
}

export type ReactiveDemoConfig = {
  originChainLabel: string
  destChainLabel: string
  originAddress?: string
  reactiveAddress?: string
  destinationAddress?: string
  txOriginDeploy?: string
  txReactiveDeploy?: string
  txDestinationDeploy?: string
  txOriginTrigger?: string
  txReactiveExecution?: string
  txDestinationCallback?: string
}

export const reactiveDemoConfig: ReactiveDemoConfig = {
  originChainLabel: env("VITE_ORIGIN_CHAIN_LABEL") ?? "Ethereum Sepolia",
  destChainLabel: env("VITE_DEST_CHAIN_LABEL") ?? "Base Sepolia",
  originAddress: env("VITE_ORIGIN_CONTRACT_ADDRESS") ?? "0xc61465d293a4F7EaA11535bB805AF6447b932298",
  reactiveAddress: env("VITE_REACTIVE_CONTRACT_ADDRESS") ?? "0x2Fb3e3f539B06940Fb37d5258dD409d36B959Bb9",
  destinationAddress: env("VITE_DESTINATION_CONTRACT_ADDRESS") ?? "0xE5181de9751b82C86ce1f5D5bd2F7B183e8cBd37",
  txOriginDeploy:
    env("VITE_TX_ORIGIN_DEPLOY") ?? "0x055d53479cb555e5e56c305e96abf97978b2fe33ccc86f2b94171aead9079717",
  txReactiveDeploy:
    env("VITE_TX_REACTIVE_DEPLOY") ?? "0xfc0219b095ad93e7c6e8cccda6ddf09c5104c094382525591d7eadeb2bb6fc6d",
  txDestinationDeploy:
    env("VITE_TX_DESTINATION_DEPLOY") ?? "0x90f101a686b5bee5b27af62adeaeb3ab570005b6e5436db6cee76de8e4cd85d7",
  txOriginTrigger: env("VITE_TX_ORIGIN_TRIGGER"),
  txReactiveExecution: env("VITE_TX_REACTIVE_EXECUTION"),
  txDestinationCallback: env("VITE_TX_DESTINATION_CALLBACK"),
}

export function hasDeploymentProof(c: ReactiveDemoConfig) {
  return Boolean(c.originAddress && c.reactiveAddress && c.destinationAddress)
}
