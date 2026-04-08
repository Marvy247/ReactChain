import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-dim font-mono">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="px-5 py-2 rounded-xl text-sm font-medium bg-accent-indigo text-white hover:shadow-premium transition-all"
    >
      Connect Wallet
    </button>
  );
}
