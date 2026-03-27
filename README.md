# FlashShield

FlashShield is a hackathon demo for cross-chain liquidation response using Reactive Network.

## Structure

- `contracts/`: Solidity contracts, tests, and deployment scripts
- `web/`: demo frontend
- `开发文档.md`: product and architecture brief
- `开发步骤.md`: execution checklist

## P0 Scope

- A-chain risk simulator emits `NearLiquidation`
- Reactive contract listens and callbacks to destination chain
- B-chain executor performs one-way mock protection with 80% risk reduction
- Frontend shows chain state and protected vs unprotected outcome

