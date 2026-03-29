# FlashShield Project Logic

This document helps teammates, judges, and future contributors understand the product logic of FlashShield.

It explains:

- what the project does today
- how the cross-chain flow should be understood at the product level
- what has already been validated
- what is intentionally out of scope in the current demo

It is **not** a code-level implementation guide.

## 1. One-Line Description

FlashShield is a **cross-chain automated risk protection demo**.

The core idea is:

- a position on the A chain enters a danger zone
- Reactive listens to the risk signal automatically
- a protection action is executed automatically on the B chain

So the claim is not “we built an exchange.” The claim is:

**Reactive can turn a risk signal on one chain into an automatic protective action on another chain.**

## 2. The Three Roles in the Current Flow

### A Chain: Origin

Current network: Ethereum Sepolia.

Responsibilities:

- simulate a position
- accept price changes
- emit a risk event when the position enters the danger zone

The A chain is the **risk source**.

### Reactive: Automation Layer

Current network: Reactive Lasna.

Responsibilities:

- listen for `NearLiquidation` on the A chain
- convert the event into a callback
- send the callback to the B chain

Reactive is the **automation relay** that makes the system cross-chain and automatic.

### B Chain: Destination

Current network: Base Sepolia.

Responsibilities:

- receive the Reactive callback
- execute the protection action
- persist the result on-chain

The B chain is the **protection execution layer**.

## 3. The Human-Level Flow

The current demo should be understood like this:

1. The user creates a demo position on the A chain from the frontend.
2. That position includes an entry price, a liquidation threshold, a collateral value, and a B-chain hedge target.
3. The user triggers a near-liquidation move from the frontend.
4. The A chain emits `NearLiquidation`.
5. Reactive detects the event.
6. Reactive automatically sends a callback to the B chain.
7. The B-chain executor receives the callback.
8. The B-chain executor computes `hedgeSize` using `collateralValue / triggerPrice / targetPrice / contractMultiplier`.
9. The B-chain executor records the action as a `mock short`.
10. The frontend reads the B-chain state and shows that the position has been hedged.

The important boundary is:

- the user triggers the risk-side action on the A chain
- once the risk event exists, the rest of the flow is automatic

## 4. What the Current Protection Action Actually Is

The current B-chain protection action is **not**:

- a real GMX perpetual short
- a real Hyperliquid short
- a real external protocol trade

What it currently does is:

- maintain a mock short state inside the B-chain executor
- write the following values on-chain when triggered:
  - `hedgeSize`
  - `triggerPrice`
  - `targetPrice`
  - `direction = SHORT`

So the current protection action is:

**an on-chain, verifiable mock-short hedge execution**

not:

**a real external protocol fill**

## 5. What Has Already Been Validated

### Already working

- A-chain position creation is a real on-chain transaction
- A-chain risk triggering is a real on-chain transaction
- Reactive listening and callback are real cross-chain automation
- The B-chain protection result is real on-chain state
- The frontend can connect a wallet and drive the full primary flow
- The frontend can show whether the current strategy actually completed protection on the B chain

### The core value already proven

**Once the origin-chain risk appears, the destination-chain protection action happens automatically.**

## 6. What The Current Demo Does Not Do Yet

### 1. No real perpetual protocol execution yet

The B chain does not yet place a real short on:

- GMX
- Hyperliquid
- or any other live derivatives protocol

This is intentional. The current stage prioritizes proving the Reactive-driven cross-chain automation flow.

### 2. No real oracle / health-factor model yet

The current A-chain risk model is still demo-oriented:

- a simulated position
- frontend or script-driven price changes
- a threshold-based `NearLiquidation` trigger

It is not yet a full lending-protocol health factor connected to a live oracle stack.

### 3. No real margin pool yet

The current demo does not fully implement:

- user-funded B-chain margin deposits
- real collateral management for live short positions
- withdrawal of unused capital after hedge completion

At this stage, it is better understood as a hedge-state simulation with real cross-chain automation.

## 7. The Most Accurate Current Positioning

The project should not be described as:

- a full cross-chain trading system
- a production-ready cross-chain hedging protocol
- a complete automated trading platform

The most accurate description is:

**a Reactive-based cross-chain automated risk response demo**

Or even more plainly:

**it proves cross-chain automated protection capability, not a finished trading product**

## 8. Recommended External Explanation

A strong concise explanation is:

> FlashShield works like this: the A chain emits the risk event, Reactive listens and forwards it across chains, and the B chain automatically opens a mock-short hedge state. The current short is still a mock on-chain execution rather than a real GMX or Hyperliquid order, but the cross-chain automation itself is real.

If someone asks what the B chain actually does, the answer is:

> The B-chain executor uses the collateral value, trigger price, target price, and contract multiplier to calculate a hedge size, then writes that hedge result on-chain as a mock short. That is a real destination-chain state change, not a frontend-only variable.

If someone asks why there is no real GMX / Hyperliquid integration yet, the answer is:

> Because the current P0+ stage is validating the Reactive-driven automated protection flow first. External protocol integration is a next-stage enhancement.
