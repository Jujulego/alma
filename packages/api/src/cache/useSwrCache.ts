import { useCallback, useContext, useMemo, useState } from 'react';

import { SwrCacheContext, SwrCacheState } from './SwrCacheContext';
import { Updator } from '../types';

// Types
export interface SwrCacheResult<R> extends SwrCacheState<R> {
  setData: (data: R | Updator<R>) => void;
}

// Hook
export function useSwrCache<R = unknown>(id: string, disableSwr = false): SwrCacheResult<R> {
  // Context
  const { cache, setCache } = useContext(SwrCacheContext);

  // State
  const [local, setLocal] = useState<R>();

  // Memo
  const data = useMemo(() => {
    if (disableSwr || cache === undefined) {
      return local;
    }

    return (cache[id]?.data) as R | undefined;
  }, [cache, local, id, disableSwr]);

  // Callback
  const setData = useCallback((data: R | Updator<R>) => {
    if (disableSwr || setCache === undefined) {
      return setLocal(data);
    }

    return setCache(id, data);
  }, [setCache, setLocal, id, disableSwr]);

  return { data, setData };
}