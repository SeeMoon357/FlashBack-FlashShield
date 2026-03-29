# FlashShield Frontend

This directory contains the public-facing frontend for the FlashShield hackathon demo.

## Stack

- React
- TypeScript
- Vite
- Wagmi / Viem

## What This Frontend Does

- Shows the landing page and the dashboard experience
- Connects the user wallet
- Sends the origin-chain transactions used in the demo flow
- Reads live state from the deployed contracts
- Displays the hedge result and related proof information

## Development

```bash
cd frontend
npm install
npm run dev:host
# 或本机访问：npm run dev:win
```

## Production Build

```bash
cd frontend
npm run build
```

## Environment

Copy the template first:

```bash
cp .env.example .env
```

Then fill in the frontend environment variables required by the dashboard.

## Notes

- The main project documentation lives in the repository root `README.md`.
- This file only describes the frontend subproject.
