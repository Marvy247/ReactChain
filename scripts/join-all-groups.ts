#!/usr/bin/env node
/**
 * join-all-groups.ts
 * Has all 50 wallets join groups 1-10
 */
import { createWalletClient, http } from 'viem';
import { celo } from 'viem/chains';
import { mnemonicToAccount } from 'viem/accounts';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { mnemonic, wallets } = JSON.parse(readFileSync(resolve(__dirname, 'wallets.json'), 'utf8'));
const accounts = wallets.map(({ index }: { index: number }) => mnemonicToAccount(mnemonic, { accountIndex: index }));

const CONTRACT = '0x076D775b1d0365527ebE730222b718bc2E9f3EB6' as `0x${string}`;
const GROUP_IDS = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n];
const JOIN_ABI = [{ name: 'joinGroup', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'groupId', type: 'uint256' }], outputs: [] }] as const;

async function main() {
  for (let i = 0; i < accounts.length; i++) {
    const wc = createWalletClient({ account: accounts[i], chain: celo, transport: http('https://forno.celo.org') });
    console.log(`\nWallet [${i}] ${accounts[i].address}`);
    for (const groupId of GROUP_IDS) {
      try {
        const hash = await wc.writeContract({ address: CONTRACT, abi: JOIN_ABI, functionName: 'joinGroup', args: [groupId] });
        console.log(`  ✅ joined group ${groupId}: ${hash.slice(0, 20)}...`);
        await new Promise(r => setTimeout(r, 2000));
      } catch (e: any) {
        console.log(`  ℹ️  group ${groupId}: ${e.shortMessage?.split('\n')[0] ?? e.message}`);
      }
    }
  }
  console.log('\nDone!');
}
main().catch(console.error);
