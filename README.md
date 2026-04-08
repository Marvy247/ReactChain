# Stokvel — On-chain Rotating Savings on Celo

A decentralized stokvel (rotating savings group) app built on Celo mainnet. Members contribute each cycle; one member receives the full pool per cycle, rotating fairly.

## Structure

```
contracts/   Foundry — Stokvel.sol smart contract
frontend/    React + Vite + Wagmi — MiniPay-compatible UI
```

## Smart Contract

**Stokvel.sol** — Core features:
- `createGroup(name, contributionAmount, cycleDuration)` — create a savings group
- `joinGroup(groupId)` — join an existing group
- `contribute(groupId)` — send your contribution for the current cycle (payable)
- `triggerPayout(groupId)` — admin triggers payout after cycle ends; recipient rotates

### Deploy to Celo Mainnet

```bash
cd contracts
cp .env.example .env   # add PRIVATE_KEY
forge script script/DeployStokvel.s.sol --rpc-url https://forno.celo.org --broadcast
```

Then update `STOKVEL_ADDRESS` in `frontend/src/contract.ts`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Built with React, Wagmi v2, Viem, Tailwind CSS, Framer Motion. MiniPay-compatible (injected wallet).

## Celo Proof of Ship

- ✅ MiniPay compatible (injected wallet hook)
- ✅ Deploys on Celo mainnet
- ✅ High transaction volume: every contribution + payout = on-chain tx
