import { useState, useEffect, useRef, useCallback } from 'react';

const CHARGE_DURATION_MS = 12000; // 12 seconds to charge
const MAX_CAPACITY_W = 80000;
const MAX_CHARGER_W = 200000;

export interface BatteryState {
  percentage: number;
  chargingWatts: number;
  outputPower: number;
  isCharging: boolean;
  isFullyCharged: boolean;
  isUnlocked: boolean;
}

export function useBatteryCharging() {
  const [state, setState] = useState<BatteryState>({
    percentage: 0,
    chargingWatts: 0,
    outputPower: 0,
    isCharging: false,
    isFullyCharged: false,
    isUnlocked: false
  });

  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);

  const tick = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / CHARGE_DURATION_MS, 1);
    const percentage = Math.floor(progress * 100);
    const chargingWatts = Math.floor(progress * MAX_CHARGER_W);
    const outputPower = Math.floor((percentage / 100) * MAX_CAPACITY_W);

    if (progress < 1) {
      setState({
        percentage,
        chargingWatts,
        outputPower,
        isCharging: true,
        isFullyCharged: false,
        isUnlocked: false
      });
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setState({
        percentage: 100,
        chargingWatts: MAX_CHARGER_W,
        outputPower: MAX_CAPACITY_W,
        isCharging: false,
        isFullyCharged: true,
        isUnlocked: true
      });
    }
  }, []);

  const startCharging = useCallback(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    startTimeRef.current = null;
    setState(s => ({ ...s, isCharging: true }));
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const resetCharging = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    hasStartedRef.current = false;
    startTimeRef.current = null;
    setState({
      percentage: 0,
      chargingWatts: 0,
      outputPower: 0,
      isCharging: false,
      isFullyCharged: false,
      isUnlocked: false
    });
  }, []);

  useEffect(() => {
    // Auto-start charging on mount
    startCharging();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startCharging]);

  return { state, startCharging, resetCharging };
}
