import { FC, useCallback, useState } from 'react';

import { SwrCacheContext, SwrCacheState } from './SwrCacheContext';

// Types
interface State {
  [id: string]: SwrCacheState<unknown>;
}

// Component
export const SwrCache: FC = ({ children }) => {
  // State
  const [cache, setCache] = useState<State>({});

  // Callbacks
  const set = useCallback((id: string, data: unknown) => {
    setCache((old) => ({ ...old, [id]: { data } }));
  }, [setCache]);

  // Render
  return <SwrCacheContext.Provider value={{ cache, setCache: set }}>{ children }</SwrCacheContext.Provider>;
};

export default SwrCache;
