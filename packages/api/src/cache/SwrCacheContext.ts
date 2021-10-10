import { createContext } from 'react';

// Types
export interface SwrCacheState<R = unknown> {
  data: R | undefined
}

export interface SwrCacheContextProps {
  cache?: Partial<Record<string, SwrCacheState>>,
  setCache?: (id: string, data: unknown) => void
}

// Context
export const SwrCacheContext = createContext<SwrCacheContextProps>({});
