import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useGroup, useHasContributed, useCyclePool, useContribute, useJoinGroup, useTriggerPayout } from '../hooks/useStokvel';

interface Props {
  groupId: bigint;
}

export default function GroupCard({ groupId }: Props) {
  const { address } = useAccount();
  const { data: group, refetch } = useGroup(groupId);
  const { data: pool } = useCyclePool(groupId, group ? group[5] : 0n);
  const { data: contributed } = useHasContributed(
    groupId,
    group ? group[5] : 0n,
    address ?? '0x0000000000000000000000000000000000000000'
  );

  const { contribute, isPending: contributing, isSuccess: contributed_ } = useContribute();
  const { joinGroup, isPending: joining, isSuccess: joined } = useJoinGroup();
  const { triggerPayout, isPending: paying, isSuccess: paid } = useTriggerPayout();

  if (contributed_) { toast.success('Contribution sent!'); refetch(); }
  if (joined) { toast.success('Joined group!'); refetch(); }
  if (paid) { toast.success('Payout triggered!'); refetch(); }

  if (!group) return null;

  const [name, admin, contributionAmount, cycleDuration, cycleStart, currentCycle, memberCount] = group;
  const isAdmin = address?.toLowerCase() === admin.toLowerCase();
  const cycleEnds = new Date((Number(cycleStart) + Number(cycleDuration)) * 1000);
  const cycleOver = Date.now() > cycleEnds.getTime();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-app-border flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-xl">{name}</h3>
          <p className="text-sm text-text-dim">Group #{groupId.toString()} · {memberCount.toString()} members</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
          Cycle {currentCycle.toString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-app-hover rounded-xl p-3">
          <p className="text-text-dim text-xs mb-1">Contribution</p>
          <p className="font-bold">{formatEther(contributionAmount)} CELO</p>
        </div>
        <div className="bg-app-hover rounded-xl p-3">
          <p className="text-text-dim text-xs mb-1">Pool this cycle</p>
          <p className="font-bold">{pool ? formatEther(pool) : '0'} CELO</p>
        </div>
        <div className="bg-app-hover rounded-xl p-3 col-span-2">
          <p className="text-text-dim text-xs mb-1">Cycle ends</p>
          <p className="font-bold">{cycleEnds.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {!contributed && !cycleOver && (
          <button
            onClick={() => contribute(groupId, contributionAmount)}
            disabled={contributing}
            className="flex-1 px-4 py-2 rounded-xl bg-accent-indigo text-white text-sm font-medium hover:shadow-premium transition-all disabled:opacity-50"
          >
            {contributing ? 'Sending…' : `Contribute ${formatEther(contributionAmount)} CELO`}
          </button>
        )}
        {contributed && (
          <span className="flex-1 text-center px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium">
            ✓ Contributed
          </span>
        )}
        {isAdmin && cycleOver && (
          <button
            onClick={() => triggerPayout(groupId)}
            disabled={paying}
            className="flex-1 px-4 py-2 rounded-xl bg-yellow-400 text-yellow-900 text-sm font-medium hover:bg-yellow-300 transition-all disabled:opacity-50"
          >
            {paying ? 'Paying…' : 'Trigger Payout'}
          </button>
        )}
        <button
          onClick={() => joinGroup(groupId)}
          disabled={joining}
          className="px-4 py-2 rounded-xl border border-app-border text-sm text-text-dim hover:bg-app-hover transition-all disabled:opacity-50"
        >
          {joining ? 'Joining…' : 'Join'}
        </button>
      </div>
    </motion.div>
  );
}
