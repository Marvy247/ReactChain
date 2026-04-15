import { useChainId, useSwitchChain } from 'wagmi';
import { celo } from 'wagmi/chains';

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (chainId !== celo.id) return (
    <div className="glass rounded-2xl p-8 border border-app-border text-center">
      <p className="text-2xl mb-2">⚠️</p>
      <p className="font-bold mb-4">Wrong network — please switch to Celo</p>
      <button onClick={() => switchChain({ chainId: celo.id })}
        className="px-6 py-3 rounded-xl bg-accent-indigo text-white font-medium">
        Switch to Celo
      </button>
    </div>
  );
  return <>{children}</>;
}
