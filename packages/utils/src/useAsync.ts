import { useEffect, useRef, useState } from 'react';

/**
 * Returns the result of the given promise
 *
 * @param promise: promise to await
 * @returns: the promise's resolved value
 */
export function useAsync<R>(promise: PromiseLike<R>): R | undefined;
export function useAsync<R>(promise: PromiseLike<R>, initial: R): R;
export function useAsync<R>(promise: PromiseLike<R>, initial?: R): R | undefined {
  // Ref
  const ref = useRef<PromiseLike<R>>();

  // State
  const [result, setResult] = useState<R | undefined>(initial);

  // Effect
  useEffect(() => {
    (async () => {
      ref.current = promise;
      const res = await promise;

      // Set result only if promise is still the last promise passed to the hook
      if (ref.current === promise) {
        setResult(res);
      }
    })();

    return () => {
      ref.current = undefined;
    };
  }, [promise]);

  return result;
}
