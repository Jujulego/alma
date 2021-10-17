import { useCallback, useContext, useMemo, useState } from 'react';

import { SwrCacheContext } from './SwrCacheContext';
import { Updator } from '../utils';

// Types
export interface SwrCacheResult<R> {
  data: R,
  setData: (data: R | Updator<R>) => void;
}

// Hook
export function useSwrCache<R = unknown>(id: string, initial: R, disableSwr = false): SwrCacheResult<R> {
  // Context
  const { cache, setCache } = useContext(SwrCacheContext);

  // State
  const [local, setLocal] = useState<R>(initial);

  // Memo
  const data = useMemo(() => {
    if (disableSwr || cache === undefined) {
      return local;
    }

    return (cache[id]?.data ?? initial) as R;
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