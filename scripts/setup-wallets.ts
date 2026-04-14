#!/usr/bin/env node
/**
 * setup-wallets.ts
 * Generates 5 deterministic wallets, funds them, and adds them to the Stokvel group.
 * Run once: npx tsx scripts/setup-wallets.ts
 */

import { createWalletClient, createPublicClient, http, parseEther, HDAccount } from 'viem';
import { celo } from 'viem/chains';
import { privateKeyToAccount, mnemonicToAccount, generateMnemonic, english } from 'viem/accounts';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../contracts/.env');
const walletsPath = resolve(__dirname, 'wallets.json');

const env = readFileSync(envPath, 'utf8');
const match = env.match(/PRIVATE_KEY=(.+)/);
if (!match) { console.error('PRIVATE_KEY not found'); process.exit(1); }

const FUNDER_KEY = match[1].trim() as `0x${string}`;
const CONTRACT = '0x076D775b1d0365527ebE730222b718bc2E9f3EB6' as `0x${string}`;
const GROUP_ID = 0n;
const FUND_AMOUNT = parseEther('0.3');
const NUM_WALLETS = 5;

const JOIN_ABI = [{
  name: 'joinGroup', type: 'function', stateMutability: 'nonpayable',
  inputs: [{ name: 'groupId', type: 'uint256' }], outputs: [],
}] as const;

const funder = privateKeyToAccount(FUNDER_KEY);
const publicClient = createPublicClient({ chain: celo, transport: http('https://forno.celo.org') });
const funderClient = createWalletClient({ account: funder, chain: celo, transport: http('https://forno.celo.org') });

async function main() {
  // Load or generate mnemonic
  let mnemonic: string;
  let existing: any = {};

  if (existsSync(walletsPath)) {
    existing = JSON.parse(readFileSync(walletsPath, 'utf8'));
    mnemonic = existing.mnemonic;
    console.log('Loaded existing wallets from wallets.json');
  } else {
    mnemonic = generateMnemonic(english);
    console.log('Generated new mnemonic — saved to scripts/wallets.json (keep this safe!)');
  }

  const wallets = Array.from({ length: NUM_WALLETS }, (_, i) =>
    mnemonicToAccount(mnemonic, { accountIndex: i })
  );

  // Save wallets info
  writeFileSync(walletsPath, JSON.stringify({
    mnemonic,
    wallets: wallets.map((w, i) => ({ index: i, address: w.address })),
  }, null, 2));

  console.log('\nWallets:');
  wallets.forEach((w, i) => console.log(`  [${i}] ${w.address}`));

  // Fund each wallet and join group
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const balance = await publicClient.getBalance({ address: wallet.address });
    console.log(`\n[${i}] ${wallet.address} — balance: ${Number(balance) / 1e18} CELO`);

    // Fund if low
    if (balance < parseEther('0.1')) {
      console.log(`  Funding with 0.3 CELO...`);
      const hash = await funderClient.sendTransaction({
        to: wallet.address,
        value: FUND_AMOUNT,
      });
      console.log(`  ✅ funded: https://explorer.celo.org/mainnet/tx/${hash}`);
      await new Promise(r => setTimeout(r, 4000));
    } else {
      console.log(`  Already funded, skipping`);
    }

    // Join group
    const wc = createWalletClient({ account: wallet as HDAccount, chain: celo, transport: http('https://forno.celo.org') });
    try {
      const hash = await wc.writeContract({
        address: CONTRACT, abi: JOIN_ABI,
        functionName: 'joinGroup', args: [GROUP_ID],
      });
      console.log(`  ✅ joined group: https://explorer.celo.org/mainnet/tx/${hash}`);
      await new Promise(r => setTimeout(r, 4000));
    } catch (e: any) {
      console.log(`  ℹ️  ${e.shortMessage ?? e.message}`);
    }
  }

  console.log('\nDone! Run the activity generator now.');
}

main().catch(console.error);
