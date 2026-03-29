# FlashShield

FlashShield is a hackathon demo built on Reactive Network. It shows a full cross-chain automation flow: a risk event is emitted on the origin chain, Reactive forwards the signal, and a protection action is executed on the destination chain.

## Demo Video

- [Watch the demo video](docs/media/demo-video.mp4)

## What Is Already Working

- The A-chain risk simulator emits `NearLiquidation` when a position enters the danger zone.
- The Reactive contract listens to the real origin event and sends a real callback to the destination chain.
- The B-chain executor calculates `hedgeSize` from `collateralValue / triggerPrice / targetPrice / contractMultiplier`.
- The destination result is recorded on-chain as a `mock short`, not as a fixed `20 / 80` rebalance.
- The frontend can connect a wallet, send the A-chain transactions, read live chain state, and display the resulting hedge.

## Current Deployment

- `PositionRiskSimulator` / Ethereum Sepolia
  - `0xc61465d293a4F7EaA11535bB805AF6447b932298`
- `ProtectionExecutor` / Base Sepolia
  - `0xE5181de9751b82C86ce1f5D5bd2F7B183e8cBd37`
- `ReactiveProtection` / Reactive Lasna
  - `0x2Fb3e3f539B06940Fb37d5258dD409d36B959Bb9`

For the full list of addresses, transaction hashes, and validation notes, see:

- [Deployment Record](docs/deployment-record.md)

## Repository Layout

- `contracts/`: Solidity contracts, tests, and deployment scripts
- `frontend/`: the public-facing React/Vite frontend used for submission
- `docs/`: deployment notes, runbook, logic notes, and local reproduction guide
- [Project Logic](docs/project-logic.md): what the system does and how the cross-chain flow should be understood
- [Local Reproduction Guide](docs/local-reproduction-guide.md): end-to-end setup, deployment, and demo commands

## Local Development

### Contracts

```bash
cd /home/moons/projects/FlashShield/contracts
npx hardhat compile
npx hardhat test
```

### Frontend

```bash
cd /home/moons/projects/FlashShield/frontend
npm install
npm run dev -- --host 0.0.0.0 --port 3000
```

## Environment Variables

Copy the template first:

```bash
cp .env.example .env
```

Keep real private keys and RPC URLs only in your local `.env`. Do not commit them.

## Recommended Reading

- [Demo Runbook](docs/demo-runbook.md)
- [Project Logic](docs/project-logic.md)
- [Local Reproduction Guide](docs/local-reproduction-guide.md)
- [Deployment Guide](docs/deployment-guide.md)

## Current Scope

This repository is already in a submission-ready hackathon state.

Possible future upgrades:

- GMX or other real perpetual protocol integration
- A more realistic oracle and health-factor model
- A complete recovery / close-hedge path
