import { useRef, useCallback } from 'react';

export function useCanvasAnimation(drawFn: () => void) {
  const rafRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  const loop = useCallback(() => {
    if (!isRunningRef.current) return;
    drawFn();
    rafRef.current = requestAnimationFrame(loop);
  }, [drawFn]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return { start, stop };
}
