# FlashShield Local Reproduction Guide

This guide is written for someone who just pulled the repository for the first time. The goal is to let you install dependencies, deploy the contracts, run the frontend, and reproduce a minimal demo flow even if you are not deeply familiar with blockchain development.

This guide assumes:

- Ubuntu / WSL2
- Node.js 20.x
- npm 10.x
- a browser wallet such as MetaMask

## 1. Clone the Repository

SSH:

```bash
git clone git@github.com:SeeMoon357/FlashShield.git
cd FlashShield
```

HTTPS:

```bash
git clone https://github.com/SeeMoon357/FlashShield.git
cd FlashShield
```

## 2. Install Dependencies

### Contracts

```bash
cd contracts
npm install
cd ..
```

### Frontend

```bash
cd frontend
npm install
cd ..
```

## 3. Prepare Environment Variables

Copy the template first:

```bash
cp .env.example .env
```

Then edit the root `.env` and fill at least:

```env
ETHEREUM_SEPOLIA_RPC_URL=
BASE_SEPOLIA_RPC_URL=
REACTIVE_RPC_URL=https://lasna-rpc.rnk.dev/
REACTIVE_CHAIN_ID=5318007
REACTIVE_CALLBACK_PROXY=
DEPLOYER_PRIVATE_KEY=
ORIGIN_CHAIN_ID=11155111
DESTINATION_CHAIN_ID=84532
EXPECTED_RVM_ID=
```

Before deployment, these can remain empty:

```env
POSITION_RISK_SIMULATOR_ADDRESS=
PROTECTION_EXECUTOR_ADDRESS=
REACTIVE_PROTECTION_ADDRESS=
```

### Variable Meanings

- `ETHEREUM_SEPOLIA_RPC_URL`: A-chain RPC
- `BASE_SEPOLIA_RPC_URL`: B-chain RPC
- `REACTIVE_RPC_URL`: Reactive Lasna RPC
- `REACTIVE_CALLBACK_PROXY`: Reactive callback proxy address
- `DEPLOYER_PRIVATE_KEY`: wallet private key used for deployment and interaction
- `EXPECTED_RVM_ID`: the wallet address used to deploy the Reactive contract, not the contract address

### How to Derive `EXPECTED_RVM_ID`

If you deploy the Reactive contract with `DEPLOYER_PRIVATE_KEY`, the corresponding wallet address is your `EXPECTED_RVM_ID`.

Use:

```bash
node derive-rvm-id.js
```

Then copy the resulting address into `.env`:

```env
EXPECTED_RVM_ID=0x...
```

## 4. Run Local Contract Checks First

```bash
cd contracts
npx hardhat compile
npx hardhat test
cd ..
```

If all tests pass, the contract workspace is healthy locally.

## 5. Deploy the A-Chain Contract

Deploy `PositionRiskSimulator` to Ethereum Sepolia:

```bash
cd contracts
npx hardhat run --network ethereumSepolia scripts/deploy-position-risk-simulator.js
```

Write the resulting address back into the root `.env`:

```env
POSITION_RISK_SIMULATOR_ADDRESS=0x...
```

## 6. Deploy the B-Chain Contract

Deploy `ProtectionExecutor` to Base Sepolia:

```bash
cd contracts
npx hardhat run --network baseSepolia scripts/deploy-protection-executor.js
```

Write the address into `.env`:

```env
PROTECTION_EXECUTOR_ADDRESS=0x...
```

This contract receives the Reactive callback on the B chain and calculates a `hedgeSize` from:

- `collateralValue`
- `triggerPrice`
- `targetPrice`
- `contractMultiplier`

The result is then recorded as an on-chain `mock short` hedge state.

## 7. Deploy the Reactive Contract

Deploy `ReactiveProtection` to Reactive Lasna:

```bash
cd contracts
npx hardhat run --network reactiveLasna scripts/deploy-reactive-protection.js
```

Write the address into `.env`:

```env
REACTIVE_PROTECTION_ADDRESS=0x...
```

## 8. Fund Reactive and the Callback Proxy

### 8.1 Cover Reactive debt

```bash
cd contracts
npx hardhat run --network reactiveLasna scripts/cover-reactive-debt.js
```

### 8.2 Deposit reserve to the Base callback proxy

```bash
export PROXY_ADDRESS="$REACTIVE_CALLBACK_PROXY"
export TARGET_ADDRESS="$PROTECTION_EXECUTOR_ADDRESS"
export DEPOSIT_VALUE_ETH="0.01"

npx hardhat run --network baseSepolia scripts/deposit-to-proxy.js
```

### 8.3 Optionally fund the destination contract directly

```bash
export TARGET_ADDRESS="$PROTECTION_EXECUTOR_ADDRESS"
export FUND_VALUE_ETH="0.01"
npx hardhat run --network baseSepolia scripts/fund-contract.js
```

## 9. Verify Deployment

Run:

```bash
cd contracts
npx hardhat run --network ethereumSepolia scripts/verify-deployment.js
```

This checks:

- whether the A-chain address has code
- whether the B-chain address has code
- whether the Reactive address has code
- whether the deployment transactions exist
- whether the receipts succeeded

## 10. Sync Addresses to the Frontend

Create the frontend runtime environment file and make sure it points to the deployed contracts.

At minimum, the frontend must know:

```env
VITE_ORIGIN_CHAIN_ID=11155111
VITE_DESTINATION_CHAIN_ID=84532
VITE_POSITION_RISK_SIMULATOR_ADDRESS=0x...
VITE_PROTECTION_EXECUTOR_ADDRESS=0x...
VITE_REACTIVE_PROTECTION_ADDRESS=0x...
```

These addresses must match the ones you just deployed.

## 11. Start the Frontend

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 3000
```

Then open:

`http://localhost:3000`

## 12. Correct UI Usage Order

1. Open the demo position  
   This sends a real A-chain transaction and requires the first wallet signature.

2. Trigger near liquidation  
   This sends the second real A-chain transaction and requires the second wallet signature.

3. Reactive callback to the B chain  
   This does not require a third signature. The cross-chain protection is automatic.

## 13. Recommended Demo Parameters

Recommended first run:

- Strategy ID: `FS-DEMO-01`
- Entry price: `100`
- Liquidation threshold: `88`
- Trigger price: `90`

Notes:

- the liquidation threshold must be lower than the entry price
- the trigger price should also be lower than the entry price

## 14. Command-Line Alternative

### 14.1 Open the A-chain position

```bash
cd contracts
STRATEGY_ID=FS-DEMO-01 ENTRY_PRICE=100 LIQUIDATION_THRESHOLD=88 \
npx hardhat run --network ethereumSepolia scripts/open-demo-position.js
```

### 14.2 Trigger near liquidation on the A chain

```bash
cd contracts
STRATEGY_ID=FS-DEMO-01 MARK_PRICE=90 \
npx hardhat run --network ethereumSepolia scripts/update-demo-price.js
```

### 14.3 Query the B-chain result

```bash
cd contracts
npx hardhat run --network baseSepolia scripts/check-protection-state.js
```

On success, you should see values such as:

- `hedgeSize = ...`
- `triggerPrice = ...`
- `targetPrice = ...`
- `direction = SHORT`
- `currentStatus = 1`

## 15. How To Tell The Full Flow Worked

You should observe:

- the position is created successfully on the A chain
- the price enters the near-liquidation zone
- `NearLiquidation` is emitted
- Reactive automatically sends the callback
- the B chain records a `mock short` result
- the frontend shows the hedge state for the current strategy

## 16. If The Page Does Not Update

Check:

1. whether the current strategy ID is the one you just used
2. whether you waited 10 to 20 seconds
3. whether the wallet is connected to the correct network
4. whether the contract addresses in `.env` and the frontend config match
5. whether `REACTIVE_CALLBACK_PROXY` and `EXPECTED_RVM_ID` are correct

Also compare with:

- [Deployment Record](./deployment-record.md)
- [Demo Runbook](./demo-runbook.md)
- [Project Logic](./project-logic.md)

## 17. Current Scope Boundary

This repository is a submission-ready hackathon demo, not a finished product.

Current limits:

- the B-chain protection action is a mock short, not a real GMX / Hyperliquid / external execution
- the hedge size is formula-driven, but still not a live perpetual position
- there is no automatic recovery / close-hedge path yet
- there is no complete deposit / withdraw margin pool flow yet

None of these limits invalidate the core conclusion: the cross-chain automated protection flow is already working.
