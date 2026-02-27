import { useState, useCallback } from 'react';

export function useSoundMagnet() {
  const [isOn, setIsOn] = useState(false);

  const toggle = useCallback(() => {
    setIsOn((prev) => !prev);
  }, []);

  return { isOn, toggle };
}
