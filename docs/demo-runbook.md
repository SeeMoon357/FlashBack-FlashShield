# FlashShield Demo Runbook

## One-Line Summary

When a position on the A chain approaches liquidation, Reactive forwards the risk event to the B chain, where a `mock short` hedge is opened automatically.

## Recommended Demo Flow

1. Open the frontend and connect a wallet.
2. Keep the default parameters or enter a new strategy ID.
3. Click `1. Open demo position`.
4. First wallet signature: create the demo position on the A chain.
5. Click `2. Trigger near liquidation`.
6. Second wallet signature: emit the risk event on the A chain.
7. The page plays the visual price-drop animation.
8. Reactive listens and forwards the callback automatically.
9. The page polls the B-chain result and shows the hedge output.

## What Judges Should Notice

- The A-chain risk event is a real on-chain event.
- The Reactive callback is real cross-chain automation.
- The B-chain result is real on-chain state, not a frontend-only variable.
- The displayed `hedgeSize` is dynamically calculated, not a hard-coded fixed percentage.
- The current short is still a mock short, not a live GMX / Hyperliquid order.

## Active Addresses

- `PositionRiskSimulator` / Ethereum Sepolia
  - `0xc61465d293a4F7EaA11535bB805AF6447b932298`
- `ProtectionExecutor` / Base Sepolia
  - `0xE5181de9751b82C86ce1f5D5bd2F7B183e8cBd37`
- `ReactiveProtection` / Reactive Lasna
  - `0x2Fb3e3f539B06940Fb37d5258dD409d36B959Bb9`

## Validated Example

- Strategy ID: `FS-HEDGE-03`
- A-chain open tx:
  - `0x517e0a5126ab4ea468c2266e786d517285a392c4d4e62efc4f004182dd7cfbeb`
- A-chain trigger tx:
  - `0x7ae6e811f727526f8e3859ac11d03fc5f4e170643c12b1547695f5e58f38d930`
- B-chain result:
  - `hedgeSize = 108`
  - `collateralValue = 1200`
  - `triggerPrice = 91`
  - `targetPrice = 82`
  - `direction = SHORT`
  - `status = ShortOpened`

## Frontend Behavior

- `Connect wallet`: connects only the current page; it does not silently auto-connect.
- `Open demo position`: requires the first signature.
- `Trigger near liquidation`: requires the second signature.
- After the second signature, the Reactive and B-chain protection steps are automatic.

## Current Limitations

- The short is still a mock short, not a live perpetual position.
- The demo validates the cross-chain hedge flow, not a full GMX / Hyperliquid integration.
- The B-chain result is shown only when the current strategy actually triggered.
