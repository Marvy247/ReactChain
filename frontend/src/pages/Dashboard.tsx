import { useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { useGroupCount } from '../hooks/useStokvel';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';

export default function Dashboard() {
  const { isConnected } = useAccount();
  const { data: groupCount } = useGroupCount();
  const [showCreate, setShowCreate] = useState(false);

  if (!isConnected) {
    return (
      <div className="glass rounded-2xl p-12 border border-app-border text-center">
        <p className="text-2xl mb-2">🔒</p>
        <p className="text-text-dim">Connect your wallet to view and join savings groups.</p>
      </div>
    );
  }

  const count = Number(groupCount ?? 0n);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-bold text-3xl">Savings Groups</h2>
          <p className="text-text-dim mt-1">{count} group{count !== 1 ? 's' : ''} on-chain</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-3 rounded-xl bg-accent-indigo text-white font-medium hover:shadow-premium transition-all"
        >
          + New Group
        </button>
      </div>

      {count === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-12 border border-app-border text-center"
        >
          <p className="text-4xl mb-4">🫙</p>
          <p className="font-bold text-xl mb-2">No groups yet</p>
          <p className="text-text-dim mb-6">Create the first savings group on Celo!</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-xl bg-accent-indigo text-white font-medium hover:shadow-premium transition-all"
          >
            Create Group
          </button>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: count }, (_, i) => (
          <GroupCard key={i} groupId={BigInt(i)} />
        ))}
      </div>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
