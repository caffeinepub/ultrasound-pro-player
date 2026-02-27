import { useRef, useCallback } from 'react';

export function useCanvasAnimation(drawFn: () => void) {
  const rafRef = useRef<number | null>(null);
  const isRunning = useRef(false);

  const loop = useCallback(() => {
    if (!isRunning.current) return;
    drawFn();
    rafRef.current = requestAnimationFrame(loop);
  }, [drawFn]);

  const start = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;
    rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const stop = useCallback(() => {
    isRunning.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  return { start, stop };
}
