# FlashShield Deployment Guide

This document describes the deployment flow for the **P0+ dynamic hedge demo**.

The goal is not to build a full production stack in one step, but to keep the deployment order, parameters, and validation checkpoints consistent.

## 1. Prerequisites

Prepare the following:

- an Ethereum Sepolia RPC URL
- a Base Sepolia RPC URL
- a Reactive RPC URL
- a test wallet private key for deployment
- enough testnet gas
- the Reactive `Callback Proxy` and `RVM ID` used for callback validation

Store sensitive values only in the root `.env` file and never commit them.

Template:

- [.env.example](../.env.example)

## 2. Deployment Order

### Step 1: Deploy the A-Chain Risk Simulator

Target contract:

- `PositionRiskSimulator`

Record:

- `POSITION_RISK_SIMULATOR_ADDRESS`

### Step 2: Deploy the B-Chain Protection Executor

Target contract:

- `ProtectionExecutor`

Constructor inputs:

- `authorizedCallbackProxy`
- `expectedRvmId`
- `contractMultiplier`

Record:

- `PROTECTION_EXECUTOR_ADDRESS`

### Step 3: Deploy the Reactive Contract

Target contract:

- `ReactiveProtection`

Constructor inputs:

- `originChainId`
- `destinationChainId`
- `originContract`
- `nearLiquidationTopic`
- `destinationExecutor`

Record:

- `REACTIVE_PROTECTION_ADDRESS`

## 3. Deployment Scripts

The repository already contains the script set:

- [deploy-position-risk-simulator.js](../contracts/scripts/deploy-position-risk-simulator.js)
- [deploy-protection-executor.js](../contracts/scripts/deploy-protection-executor.js)
- [deploy-reactive-protection.js](../contracts/scripts/deploy-reactive-protection.js)

## 4. Post-Deployment Checks

At minimum, verify:

1. The A-chain contract is deployed and `openPosition` works.
2. The B-chain contract is deployed and `contractMultiplier` is correct.
3. The Reactive contract parameters match the A/B-chain addresses.
4. The frontend configuration is updated with the latest contract addresses.

## 5. End-to-End Validation

Check the live flow in this order:

1. Run `openPosition` on the A chain.
2. Run `updateMarkPrice` on the A chain.
3. Confirm that the A chain emits `NearLiquidation`.
4. Confirm that Reactive receives the event and sends the callback.
5. Confirm that the B chain executes `onReactiveCallback`.
6. Confirm that `ShortPositionOpened` is emitted.
7. Confirm that the frontend shows `ShortOpened / hedged`.

## 6. Required Runtime Parameters

Before live deployment, provide:

- `ETHEREUM_SEPOLIA_RPC_URL`
- `BASE_SEPOLIA_RPC_URL`
- `REACTIVE_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`
- `REACTIVE_CALLBACK_PROXY`
- `EXPECTED_RVM_ID`

If the Reactive side requires any extra account, system, or network parameter, add it before deployment.
