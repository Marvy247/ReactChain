import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { STOKVEL_ADDRESS, STOKVEL_ABI } from '../contract';

export function useGroupCount() {
  return useReadContract({
    address: STOKVEL_ADDRESS,
    abi: STOKVEL_ABI,
    functionName: 'groupCount',
  });
}

export function useGroup(groupId: bigint) {
  return useReadContract({
    address: STOKVEL_ADDRESS,
    abi: STOKVEL_ABI,
    functionName: 'getGroup',
    args: [groupId],
  });
}

export function useMembers(groupId: bigint) {
  return useReadContract({
    address: STOKVEL_ADDRESS,
    abi: STOKVEL_ABI,
    functionName: 'getMembers',
    args: [groupId],
  });
}

export function useHasContributed(groupId: bigint, cycle: bigint, member: `0x${string}`) {
  return useReadContract({
    address: STOKVEL_ADDRESS,
    abi: STOKVEL_ABI,
    functionName: 'hasContributed',
    args: [groupId, cycle, member],
  });
}

export function useCyclePool(groupId: bigint, cycle: bigint) {
  return useReadContract({
    address: STOKVEL_ADDRESS,
    abi: STOKVEL_ABI,
    functionName: 'getCyclePool',
    args: [groupId, cycle],
  });
}

export function useCreateGroup() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createGroup = (name: string, contributionEther: string, cycleDays: number) => {
    writeContract({
      address: STOKVEL_ADDRESS,
      abi: STOKVEL_ABI,
      functionName: 'createGroup',
      args: [name, parseEther(contributionEther), BigInt(cycleDays * 86400)],
    });
  };

  return { createGroup, isPending: isPending || isConfirming, isSuccess, hash };
}

export function useJoinGroup() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const joinGroup = (groupId: bigint) => {
    writeContract({
      address: STOKVEL_ADDRESS,
      abi: STOKVEL_ABI,
      functionName: 'joinGroup',
      args: [groupId],
    });
  };

  return { joinGroup, isPending: isPending || isConfirming, isSuccess, hash };
}

export function useContribute() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const contribute = (groupId: bigint, amount: bigint) => {
    writeContract({
      address: STOKVEL_ADDRESS,
      abi: STOKVEL_ABI,
      functionName: 'contribute',
      args: [groupId],
      value: amount,
    });
  };

  return { contribute, isPending: isPending || isConfirming, isSuccess, hash };
}

export function useTriggerPayout() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const triggerPayout = (groupId: bigint) => {
    writeContract({
      address: STOKVEL_ADDRESS,
      abi: STOKVEL_ABI,
      functionName: 'triggerPayout',
      args: [groupId],
    });
  };

  return { triggerPayout, isPending: isPending || isConfirming, isSuccess, hash };
}
