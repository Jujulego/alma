import { FC, ReactNode, useCallback, useState } from 'react';

import { SwrCacheContext, SwrCacheState } from './SwrCacheContext';
import { normalizeUpdator, Updator } from '../utils';

// Component
export const SwrCache: FC<{ children?: ReactNode }> = ({ children }) => {
  // State
  const [cache, setCache] = useState<Partial<Record<string, SwrCacheState>>>({});

  // Callbacks
  const set = useCallback((id: string, data: unknown | Updator) => {
    setCache((old) => ({ ...old, [id]: { data: normalizeUpdator(data)(old[id]?.data) } }));
  }, [setCache]);

  // Render
  return <SwrCacheContext.Provider value={{ cache, setCache: set }}>{ children }</SwrCacheContext.Provider>;
};

export default SwrCache;
