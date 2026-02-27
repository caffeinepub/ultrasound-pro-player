import { useState, useEffect, useRef } from 'react';

export interface BatteryState {
  percentage: number;
  watts: number;
  outputPower: number;
  isUnlocked: boolean;
}

const CHARGE_DURATION_MS = 12000;
const MAX_CAPACITY_WATTS = 80000;
const CHARGER_WATTS = 200000;

export function useBatteryCharging() {
  const [state, setState] = useState<BatteryState>({
    percentage: 0,
    watts: 0,
    outputPower: 0,
    isUnlocked: false,
  });
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / CHARGE_DURATION_MS, 1);
      const percentage = Math.round(progress * 100);
      const watts = Math.round((percentage / 100) * MAX_CAPACITY_WATTS);
      const outputPower = Math.round(watts * 0.85);
      const isUnlocked = percentage >= 100;

      setState({ percentage, watts, outputPower, isUnlocked });

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { state, CHARGER_WATTS };
}
