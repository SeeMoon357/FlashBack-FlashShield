# FlashShield

FlashShield is a hackathon demo for cross-chain liquidation response using Reactive Network.

## What It Does

- A-chain risk simulator emits `NearLiquidation`
- Reactive contract listens and callbacks to destination chain
- B-chain executor performs one-way mock protection with 80% risk reduction
- Frontend shows chain state and protected vs unprotected outcome

## Project Files

- `contracts/`: Solidity contracts, tests, and deployment scripts
- `web/`: frontend demo
- `docs/`: deployment and auxiliary docs
- `开发文档.md`: product and architecture brief
- `开发步骤.md`: execution checklist

## Current Status

Current repository status:

- P0 contract scaffold implemented
- P0 frontend scaffold implemented
- Local contract tests passing
- Frontend typecheck/build passing
- Real testnet deployment not started yet

## Local Development

### Contracts

Run in WSL with the local Node binary already installed for the current user:

```bash
cd /home/moons/projects/FlashShield/contracts
/home/moons/.local/node-v20.20.0-linux-x64/bin/node ./node_modules/hardhat/internal/cli/cli.js compile
/home/moons/.local/node-v20.20.0-linux-x64/bin/node ./node_modules/hardhat/internal/cli/cli.js test
```

### Frontend

```bash
cd /home/moons/projects/FlashShield/web
/home/moons/.local/node-v20.20.0-linux-x64/bin/node ./node_modules/typescript/bin/tsc --noEmit
/home/moons/.local/node-v20.20.0-linux-x64/bin/node ./node_modules/next/dist/bin/next build
```

## Environment Variables

Create a local `.env` from:

```bash
cp .env.example .env
```

Never commit `.env` or private keys.

## Deployment

Deployment notes and required parameters are documented in:

- [部署说明.md](/home/moons/projects/FlashShield/docs/部署说明.md)

## Next Step

The next engineering milestone is real testnet deployment and callback wiring.  
Before that, the remaining requirement is filling the real deployment parameters in `.env`.
