import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { sepolia } from "viem/chains"
import { getPublicClient, waitForTransactionReceipt } from "@wagmi/core"
import { useAccount, useSwitchChain, useWriteContract } from "wagmi"

import { reactiveDemoConfig, type ReactiveDemoConfig } from "@/config/reactiveDemo"
import { wagmiConfig } from "@/lib/wagmi-config"

import { encodeBytes32String } from "@/integrations/flashshield/bytes32"
import { positionRiskSimulatorAbi } from "@/integrations/flashshield/contractAbi"
import { fetchFlashShieldDemoState } from "@/integrations/flashshield/demoState"
import { flashShieldConfig } from "@/integrations/flashshield/config"

import { INITIAL_HISTORY } from "./constants"
import { ControlPanel } from "./ControlPanel"
import { DeploymentProofPanel } from "./DeploymentProofPanel"
import { FlowVisualization } from "./FlowVisualization"
import { HistoryTable } from "./HistoryTable"
import { KpiCards } from "./KpiCards"
import { Navbar } from "./Navbar"
import type { FlowPhase, HedgeHistoryRow, LastTx, SystemStatus } from "./types"
import { buildChartPoints, demoPlaceholderTxHash, formatUsd, shortenAddr } from "./utils"

const INITIAL_PRICE = 3250.8
const INITIAL_THRESHOLD = 3200
const INITIAL_HEDGE = 0
const GAS_OPEN_POSITION = 450_000n
const GAS_UPDATE_MARK_PRICE = 350_000n

async function readWalletChainId(): Promise<number | undefined> {
  const eth = (window as unknown as { ethereum?: { request?: (a: { method: string }) => Promise<string> } })
    .ethereum
  if (!eth?.request) return undefined
  try {
    const hex = await eth.request({ method: "eth_chainId" })
    return Number.parseInt(hex, 16)
  } catch {
    return undefined
  }
}

export function Dashboard() {
  const navigate = useNavigate()
  const { isConnected, address } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync, isPending: isWritePending } = useWriteContract()
  const prevConnectedRef = useRef(false)
  const [monitorArmed, setMonitorArmed] = useState(false)
  const [asset, setAsset] = useState("ETH")
  const [hedgeRatio, setHedgeRatio] = useState(120)
  const [heartbeatSecAgo, setHeartbeatSecAgo] = useState(5)
  const [pendingMessages, setPendingMessages] = useState(0)
  const [hedgeCount, setHedgeCount] = useState(0)
  const [ethPrice, setEthPrice] = useState(INITIAL_PRICE)
  const [threshold, setThreshold] = useState(INITIAL_THRESHOLD)
  const [hedgeValue, setHedgeValue] = useState(INITIAL_HEDGE)
  const [systemStatus, setSystemStatus] = useState<SystemStatus>("monitoring")
  const [flowPhase, setFlowPhase] = useState<FlowPhase>("idle")
  const [reactorMessages, setReactorMessages] = useState<string[]>([])
  const [lastTx, setLastTx] = useState<LastTx | null>(null)
  const [history, setHistory] = useState<HedgeHistoryRow[]>(() => [...INITIAL_HISTORY])
  const [chartData, setChartData] = useState(() => buildChartPoints(INITIAL_PRICE))
  const [isSimulating, setIsSimulating] = useState(false)
  const [strategyId] = useState(`DEMO-${Date.now()}`)
  const [hasOpenedPosition, setHasOpenedPosition] = useState(false)
  const simulateLockRef = useRef(false)

  const proofConfig: ReactiveDemoConfig = {
    ...reactiveDemoConfig,
    txOriginTrigger: lastTx?.originTxHash || reactiveDemoConfig.txOriginTrigger,
    txDestinationCallback: lastTx?.destTxHash || reactiveDemoConfig.txDestinationCallback,
  }

  const timersRef = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  useEffect(() => {
    return () => clearTimers()
  }, [clearTimers])

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeartbeatSecAgo((s) => (s >= 59 ? 1 : s + 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setChartData(buildChartPoints(ethPrice))
  }, [ethPrice])

  useEffect(() => {
    if (prevConnectedRef.current && !isConnected) {
      setMonitorArmed(false)
      setSystemStatus("idle")
      setReactorMessages(["钱包已断开，请重新连接或使用顶部按钮再次连接。"])
      toast.message("钱包已断开")
    }
    if (!prevConnectedRef.current && isConnected) {
      setSystemStatus("idle")
      setReactorMessages(["钱包已连接，请点击「开始监控」或使用 /live 进行链上操作。"])
    }
    prevConnectedRef.current = isConnected
  }, [isConnected])

  const ensureSepolia = useCallback(async () => {
    const walletId = await readWalletChainId()
    if (walletId === sepolia.id) return
    if (!switchChainAsync) {
      throw new Error("当前钱包不支持自动切链，请手动切到 Ethereum Sepolia。")
    }
    await switchChainAsync({ chainId: sepolia.id })
    for (let i = 0; i < 30; i += 1) {
      const id = await readWalletChainId()
      if (id === sepolia.id) return
      await new Promise((r) => window.setTimeout(r, 150))
    }
    throw new Error("切链未生效，请在钱包中确认已切到 Ethereum Sepolia。")
  }, [switchChainAsync])

  const pollProtection = useCallback(async (targetStrategyId: string) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const st = await fetchFlashShieldDemoState(targetStrategyId)
      if (st.ok && st.protection.appliesToRequestedStrategy) {
        return st
      }
      setPendingMessages(1)
      setReactorMessages([
        `A 链已触发，等待 Reactive 回调... 第 ${attempt + 1}/8 次查询`,
      ])
      await new Promise((r) => window.setTimeout(r, 4000))
    }
    return null
  }, [])

  const handleOpenPosition = useCallback(async () => {
    if (!isConnected || !address) {
      toast.error("请先连接钱包")
      return
    }
    setIsSimulating(true)
    try {
      await ensureSepolia()
      const simAddr = flashShieldConfig.positionRiskSimulatorAddress as `0x${string}`
      const sid = encodeBytes32String(strategyId)
      const entryPrice = BigInt(Math.round(Math.max(ethPrice, threshold + 300)))
      const liquidationThreshold = BigInt(Math.round(threshold))
      const collateralValue = 1000n
      const targetPrice = BigInt(Math.max(1, Math.round(threshold - 200)))
      const publicClient = getPublicClient(wagmiConfig, { chainId: sepolia.id })
      await publicClient.simulateContract({
        address: simAddr,
        abi: positionRiskSimulatorAbi,
        functionName: "openPosition",
        args: [sid, entryPrice, liquidationThreshold, collateralValue, targetPrice],
        account: address,
        gas: GAS_OPEN_POSITION,
      })
      const hash = await writeContractAsync({
        address: simAddr,
        abi: positionRiskSimulatorAbi,
        functionName: "openPosition",
        args: [sid, entryPrice, liquidationThreshold, collateralValue, targetPrice],
        chainId: sepolia.id,
        gas: GAS_OPEN_POSITION,
      })
      await waitForTransactionReceipt(wagmiConfig, { hash })
      setHasOpenedPosition(true)
      setMonitorArmed(true)
      setSystemStatus("monitoring")
      setReactorMessages([
        `链上开仓成功: ${hash}`,
        "下一步：点击「模拟价格暴跌（演示）」触发真实 updateMarkPrice。",
      ])
      toast.success("开仓已上链")
    } catch (error) {
      toast.error("开仓失败", { description: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsSimulating(false)
    }
  }, [address, ensureSepolia, ethPrice, isConnected, strategyId, threshold, writeContractAsync])

  const handleReset = useCallback(() => {
    clearTimers()
    simulateLockRef.current = false
    setIsSimulating(false)
    setEthPrice(INITIAL_PRICE)
    setThreshold(INITIAL_THRESHOLD)
    setHedgeValue(INITIAL_HEDGE)
    setHedgeCount(0)
    setSystemStatus("monitoring")
    setMonitorArmed(false)
    setFlowPhase("idle")
    setReactorMessages([])
    setPendingMessages(0)
    setLastTx(null)
    setHistory([...INITIAL_HISTORY].slice(0, 0))
  }, [clearTimers])

  const handleStartMonitoring = useCallback(() => {
    if (!isConnected) {
      setReactorMessages(["请先在右上角连接钱包（MetaMask 等注入钱包）"])
      setSystemStatus("idle")
      toast.error("请先连接钱包")
      return
    }
    setMonitorArmed(true)
    setSystemStatus("monitoring")
    setFlowPhase("idle")
    setReactorMessages([
      "系统已进入监听状态（演示：真实流程由源链 emit → 睿应 subscribe → 目标 Callback）",
      `监听目标：${asset}/USD，阈值 ${formatUsd(threshold)} · 源链 ${reactiveDemoConfig.originChainLabel}`,
    ])
    setPendingMessages(0)
  }, [asset, threshold, isConnected])

  const handleSimulateCrash = useCallback(() => {
    if (simulateLockRef.current || !isConnected || !monitorArmed || isWritePending) return
    if (!hasOpenedPosition) {
      toast.error("请先链上开仓")
      return
    }
    simulateLockRef.current = true
    clearTimers()
    setIsSimulating(true)
    setLastTx(null)
    setSystemStatus("executing")
    void (async () => {
      try {
        await ensureSepolia()
        const simAddr = flashShieldConfig.positionRiskSimulatorAddress as `0x${string}`
        const sid = encodeBytes32String(strategyId)
        const crashPrice = Math.round(Math.max(threshold + 30, ethPrice - 80))
        setEthPrice(crashPrice)
        setFlowPhase("oracle")
        setReactorMessages([`源链：提交 updateMarkPrice(${crashPrice})`])
        const publicClient = getPublicClient(wagmiConfig, { chainId: sepolia.id })
        await publicClient.simulateContract({
          address: simAddr,
          abi: positionRiskSimulatorAbi,
          functionName: "updateMarkPrice",
          args: [sid, BigInt(crashPrice)],
          account: address as `0x${string}`,
          gas: GAS_UPDATE_MARK_PRICE,
        })
        const hash = await writeContractAsync({
          address: simAddr,
          abi: positionRiskSimulatorAbi,
          functionName: "updateMarkPrice",
          args: [sid, BigInt(crashPrice)],
          chainId: sepolia.id,
          gas: GAS_UPDATE_MARK_PRICE,
        })
        await waitForTransactionReceipt(wagmiConfig, { hash })
        setFlowPhase("reactor")
        setPendingMessages(1)
        setReactorMessages((old) => [...old, `源链触发 Tx: ${hash}`, "等待 Reactive 回调到目标链..."])
        const finalState = await pollProtection(strategyId)
        if (finalState) {
          const destTx = finalState.callback.protectionTxHash
          const sizeEth = Number(finalState.protection.hedgeSize || 0)
          const estPnlUsd = Number((sizeEth * crashPrice).toFixed(2))
          setFlowPhase("done")
          setPendingMessages(0)
          setHedgeValue((v) => v + estPnlUsd)
          setHedgeCount((c) => c + 1)
          setLastTx({
            asset,
            sizeEth,
            estPnlUsd,
            txHash: shortenAddr(destTx || hash),
            originTxHash: hash,
            destTxHash: destTx,
          })
          setHistory((h) => [
            {
              id: `h-${Date.now()}`,
              time: new Date().toLocaleString("zh-CN", { hour12: false }),
              triggerPrice: formatUsd(crashPrice),
              hedgeChain: reactiveDemoConfig.destChainLabel,
              size: `${sizeEth} ETH`,
              estPnl: `+${formatUsd(estPnlUsd)}`,
              status: "success",
              destTxHash: destTx || demoPlaceholderTxHash(),
            },
            ...h,
          ])
          setReactorMessages((old) => [...old, "目标链回调已确认，流程完成。"])
          toast.success("链上砸盘触发完成")
        } else {
          setPendingMessages(0)
          setFlowPhase("reactor")
          setReactorMessages((old) => [...old, "A 链已触发，但暂未查到目标链回调。"])
          toast.message("已触发A链，等待B链回调")
        }
      } catch (error) {
        toast.error("链上触发失败", { description: error instanceof Error ? error.message : String(error) })
      } finally {
        setSystemStatus("monitoring")
        setIsSimulating(false)
        simulateLockRef.current = false
      }
    })()
  }, [
    address,
    asset,
    clearTimers,
    ensureSepolia,
    ethPrice,
    hasOpenedPosition,
    isConnected,
    isWritePending,
    monitorArmed,
    pollProtection,
    strategyId,
    threshold,
    writeContractAsync,
  ])

  return (
    <div className="min-h-svh bg-[#F8F5F0] text-[#0A1F3F]">
      <Navbar
        originChainLabel={proofConfig.originChainLabel}
        destChainLabel={proofConfig.destChainLabel}
      />

      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6">
        <KpiCards ethPrice={ethPrice} hedgeValue={hedgeValue} systemStatus={systemStatus} />

        <DeploymentProofPanel config={proofConfig} />

        <div className="grid gap-6 lg:grid-cols-4 lg:items-start">
          <div className="space-y-6 lg:col-span-3">
            <FlowVisualization
              chartData={chartData}
              walletConnected={isConnected}
              asset={asset}
              ethPrice={ethPrice}
              threshold={threshold}
              hedgeRatio={hedgeRatio}
              heartbeatSecAgo={heartbeatSecAgo}
              pendingMessages={pendingMessages}
              hedgeCount={hedgeCount}
              hedgeValue={hedgeValue}
              flowPhase={flowPhase}
              reactorMessages={reactorMessages}
              lastTx={lastTx}
            />
          </div>
          <div className="lg:col-span-1">
            <ControlPanel
              walletConnected={isConnected}
              monitorArmed={monitorArmed}
              hasOpenedPosition={hasOpenedPosition}
              ethPrice={ethPrice}
              onPriceChange={setEthPrice}
              asset={asset}
              onAssetChange={setAsset}
              threshold={threshold}
              onThresholdChange={setThreshold}
              hedgeRatio={hedgeRatio}
              onHedgeRatioChange={setHedgeRatio}
              onSimulateCrash={handleSimulateCrash}
              onStartMonitoring={handleStartMonitoring}
              onOpenPosition={handleOpenPosition}
              onReset={handleReset}
              disabled={isSimulating || isWritePending}
              onOpenLive={() => navigate("/live")}
            />
          </div>
        </div>

        <HistoryTable rows={history} />
      </div>
    </div>
  )
}
