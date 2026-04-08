import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useCreateGroup } from '../hooks/useStokvel';

export default function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState(7);
  const { createGroup, isPending, isSuccess } = useCreateGroup();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    createGroup(name, amount, days);
    toast.loading('Creating group…', { id: 'create' });
  };

  if (isSuccess) {
    toast.success('Group created!', { id: 'create' });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-8 border border-app-border w-full max-w-md"
      >
        <h2 className="font-serif font-bold text-2xl mb-6">Create Savings Group</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="input-field"
            placeholder="Group name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="input-field"
            placeholder="Contribution per cycle (CELO)"
            type="number"
            step="0.001"
            min="0.001"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm text-text-dim">Cycle duration: {days} day{days > 1 ? 's' : ''}</label>
            <input
              type="range"
              min={1}
              max={30}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-app-border text-text-dim hover:bg-app-hover transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-accent-indigo text-white font-medium hover:shadow-premium transition-all disabled:opacity-50"
            >
              {isPending ? 'Creating…' : 'Create Group'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
