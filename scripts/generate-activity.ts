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
  : [privateKeyToAccount(FUNDER_KEY)];

const CONTRACT = '0x076D775b1d0365527ebE730222b718bc2E9f3EB6' as `0x${string}`;
const GROUP_IDS = [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n];
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

// Admin wallet (funder) handles payouts; sub-wallets only contribute
const adminAccount = privateKeyToAccount(FUNDER_KEY);
const walletIndex = Math.floor(Date.now() / 1000 / 60) % accounts.length;
const account = accounts[walletIndex] as HDAccount;

async function main() {
  console.log(`[${new Date().toISOString()}] Wallet [${walletIndex}]: ${account.address}`);

  const wc = createWalletClient({ account, chain: celo, transport: http(RPCS[0]) });
  const adminWc = createWalletClient({ account: adminAccount, chain: celo, transport: http(RPCS[0]) });
  const pc = createPublicClient({ chain: celo, transport: http(RPCS[0]) });

  // Check balance upfront — skip if not enough for at least 1 group
  const balance = await pc.getBalance({ address: account.address });
  const minRequired = parseEther('0.015'); // 0.01 contribution + gas
  if (balance < minRequired) {
    console.log(`  ⚠️  Low balance (${Number(balance) / 1e18} CELO) — skipping`);
    return;
  }

  // How many groups can this wallet afford this run
  const maxGroups = Math.min(GROUP_IDS.length, Math.floor(Number(balance) / Number(parseEther('0.012'))));

  for (const GROUP_ID of GROUP_IDS.slice(0, maxGroups)) {
    const group = await withRetry(rpc =>
      createPublicClient({ chain: celo, transport: http(rpc) })
        .readContract({ address: CONTRACT, abi: ABI, functionName: 'getGroup', args: [GROUP_ID] })
    ).catch(() => null);
    if (!group) continue;

    const [,, , cycleDuration, cycleStart, currentCycle] = group;
    const cycleOver = BigInt(Math.floor(Date.now() / 1000)) >= cycleStart + cycleDuration;

    if (cycleOver) {
      try {
        const hash = await adminWc.writeContract({ address: CONTRACT, abi: ABI, functionName: 'triggerPayout', args: [GROUP_ID] });
        console.log(`  ✅ [group ${GROUP_ID}] triggerPayout: ${hash.slice(0, 20)}...`);
        await new Promise(r => setTimeout(r, 3000));
      } catch (e: any) { /* cycle not over or already paid */ }
    }

    const already = await withRetry(rpc =>
      createPublicClient({ chain: celo, transport: http(rpc) })
        .readContract({ address: CONTRACT, abi: ABI, functionName: 'hasContributed',
          args: [GROUP_ID, currentCycle + (cycleOver ? 1n : 0n), account.address] })
    ).catch(() => true);

    if (!already) {
      try {
        const hash = await wc.writeContract({ address: CONTRACT, abi: ABI, functionName: 'contribute', args: [GROUP_ID], value: AMOUNT });
        console.log(`  ✅ [group ${GROUP_ID}] contribute: ${hash.slice(0, 20)}...`);
        await new Promise(r => setTimeout(r, 2000));
      } catch (e: any) { console.error(`  ❌ [group ${GROUP_ID}]: ${e.shortMessage?.split('\n')[0]}`); }
    }
  }
}

main().catch(console.error);
