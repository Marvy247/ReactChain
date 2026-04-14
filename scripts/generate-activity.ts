#!/usr/bin/env node
/**
 * Stokvel Activity Generator
 * Rotates through multiple wallets — each cycle a different address contributes.
 * Usage: npx tsx scripts/generate-activity.ts
 */

import { createWalletClient, createPublicClient, http, parseEther, HDAccount } from 'viem';
import { celo } from 'viem/chains';
import { privateKeyToAccount, mnemonicToAccount } from 'viem/accounts';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load funder key
const env = readFileSync(resolve(__dirname, '../contracts/.env'), 'utf8');
const keyMatch = env.match(/PRIVATE_KEY=(.+)/);
if (!keyMatch) { console.error('PRIVATE_KEY not found in contracts/.env'); process.exit(1); }
const FUNDER_KEY = keyMatch[1].trim() as `0x${string}`;

// Load wallets
const walletsPath = resolve(__dirname, 'wallets.json');
const accounts = existsSync(walletsPath)
  ? (() => {
      const { mnemonic, wallets } = JSON.parse(readFileSync(walletsPath, 'utf8'));
      return wallets.map(({ index }: { index: number }) => mnemonicToAccount(mnemonic, { accountIndex: index }));
    })()
  : [privateKeyToAccount(FUNDER_KEY)]; // fallback to single wallet

const CONTRACT = '0x076D775b1d0365527ebE730222b718bc2E9f3EB6' as `0x${string}`;
const GROUP_ID = 0n;
const AMOUNT = parseEther('0.01');

const RPCS = ['https://forno.celo.org', 'https://rpc.ankr.com/celo'];

const ABI = [
  { name: 'contribute',    type: 'function', stateMutability: 'payable',    inputs: [{ name: 'groupId', type: 'uint256' }], outputs: [] },
  { name: 'triggerPayout', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'groupId', type: 'uint256' }], outputs: [] },
  { name: 'getGroup',      type: 'function', stateMutability: 'view',
    inputs: [{ name: 'groupId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' }, { name: 'admin', type: 'address' },
      { name: 'contributionAmount', type: 'uint256' }, { name: 'cycleDuration', type: 'uint256' },
      { name: 'cycleStart', type: 'uint256' }, { name: 'currentCycle', type: 'uint256' },
      { name: 'memberCount', type: 'uint256' },
    ]
  },
  { name: 'hasContributed', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'groupId', type: 'uint256' }, { name: 'cycle', type: 'uint256' }, { name: 'member', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
] as const;

async function withRetry<T>(fn: (rpc: string) => Promise<T>): Promise<T> {
  for (const rpc of RPCS) {
    try { return await fn(rpc); } catch (e: any) {
      console.error(`  ⚠ ${rpc} failed: ${e.shortMessage ?? e.message}`);
    }
  }
  throw new Error('All RPCs failed');
}

// Pick which wallet to use this run (rotate by minute)
const walletIndex = Math.floor(Date.now() / 1000 / 60) % accounts.length;
const account = accounts[walletIndex] as HDAccount;

async function main() {
  console.log(`[${new Date().toISOString()}] Wallet [${walletIndex}]: ${account.address}`);

  const group = await withRetry(rpc =>
    createPublicClient({ chain: celo, transport: http(rpc) })
      .readContract({ address: CONTRACT, abi: ABI, functionName: 'getGroup', args: [GROUP_ID] })
  );

  const [,, , cycleDuration, cycleStart, currentCycle] = group;
  const cycleOver = BigInt(Math.floor(Date.now() / 1000)) >= cycleStart + cycleDuration;
  console.log(`  Cycle ${currentCycle} | cycleOver: ${cycleOver}`);

  const wc = createWalletClient({ account, chain: celo, transport: http(RPCS[0]) });

  if (cycleOver) {
    try {
      const hash = await wc.writeContract({ address: CONTRACT, abi: ABI, functionName: 'triggerPayout', args: [GROUP_ID] });
      console.log(`  ✅ triggerPayout: https://explorer.celo.org/mainnet/tx/${hash}`);
    } catch (e: any) { console.error(`  ❌ triggerPayout: ${e.shortMessage ?? e.message}`); }
    await new Promise(r => setTimeout(r, 4000));
  }

  const already = await withRetry(rpc =>
    createPublicClient({ chain: celo, transport: http(rpc) })
      .readContract({ address: CONTRACT, abi: ABI, functionName: 'hasContributed',
        args: [GROUP_ID, currentCycle + (cycleOver ? 1n : 0n), account.address] })
  );

  if (!already) {
    try {
      const hash = await wc.writeContract({ address: CONTRACT, abi: ABI, functionName: 'contribute', args: [GROUP_ID], value: AMOUNT });
      console.log(`  ✅ contribute: https://explorer.celo.org/mainnet/tx/${hash}`);
    } catch (e: any) { console.error(`  ❌ contribute: ${e.shortMessage ?? e.message}`); }
  } else {
    console.log(`  ℹ️  Already contributed this cycle`);
  }
}

main().catch(console.error);
