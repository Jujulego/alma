import { useEffect, useState } from 'react';

/**
 * Force the component to render regularly
 *
 * @param ms: milliseconds to wait before re-rendering the component
 * @param cb: callback that will be called before triggering a new render
 * @returns: count of render since the component is mounted
 */
export function useInterval(ms: number, cb?: () => void): number {
  // State
  const [count, setCount] = useState(0);

  // Effects
  useEffect(() => {
    const interval = setInterval(() => {
      if (cb) cb();
      setCount((old) => old + 1);
    }, ms);

    return () => {
      clearInterval(interval);
    };
  }, [cb, ms]);

  return count;
}
