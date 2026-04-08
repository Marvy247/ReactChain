import { useEffect, useState } from 'react';

/** Returns true when the app is running inside MiniPay */
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);

  useEffect(() => {
    setIsMiniPay(
      typeof window !== 'undefined' &&
      !!(window as any).ethereum?.isMiniPay
    );
  }, []);

  return isMiniPay;
}
