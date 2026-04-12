import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useTxToast(isSuccess: boolean, isPending: boolean, successMsg: string) {
  useEffect(() => {
    if (isPending) toast.loading('Waiting for confirmation…', { id: 'tx' });
    if (isSuccess) toast.success(successMsg, { id: 'tx' });
  }, [isPending, isSuccess, successMsg]);
}
