import { createContext, useCallback, useContext } from 'react';

// Types
export interface SwrCacheState<R> {
  data?: R
}

export interface SwrCacheContextProps {
  cache: { [id: string]: SwrCacheState<unknown> }
  setCache: (id: string, data: unknown) => void
}

export interface SwrCacheProps<R> extends SwrCacheState<R> {
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
export function useSwrCache<R = unknown>(id: string): SwrCacheProps<R> {
  const { cache, setCache } = useContext(SwrCacheContext);

  return {
    ...cache[id],
    setCache: useCallback((data: R) => setCache(id, data), [setCache, id])
  } as SwrCacheProps<R>;
}
