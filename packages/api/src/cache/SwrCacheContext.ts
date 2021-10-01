import { createContext, useCallback, useContext } from 'react';

// Types
export interface SwrCacheState<R> {
  data: R | undefined
}

export interface SwrCacheContextProps {
  cache: { [id: string]: SwrCacheState<unknown> }
  setCache: (id: string, data: unknown) => void
}

export interface SwrCacheResult<R> extends SwrCacheState<R> {
  setCache: (data: R) => void
}

// Defaults
const swrCacheDefaults: SwrCacheContextProps = {
  cache: {},
  setCache: () => undefined
};

// Context
export const SwrCacheContext = createContext(swrCacheDefaults);

// Hook
export function useSwrCache<R = unknown>(id: string): SwrCacheResult<R> {
  const { cache, setCache } = useContext(SwrCacheContext);

  return {
    data: cache[id]?.data as R | undefined,
    setCache: useCallback((data: R) => setCache(id, data), [setCache, id])
  };
}
