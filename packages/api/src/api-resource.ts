import { useDeepMemo } from '@jujulego/alma-utils';
import { useMemo } from 'react';

import { useApi } from './api';

// Types
export type IApiResourceUrlBuilder<A extends unknown[]> = (...args: A) => string;

export interface IApiResourceReadState<T> {
  loading: boolean;
  data?: T;

  reload: () => void;
}

export type IApiResourceReadHook<T, A extends unknown[] = []> = ((...args: A) => IApiResourceReadState<T>) & {
  url: string | IApiResourceUrlBuilder<A>
};

// Hook maker
export function apiResource<T, A extends unknown[] = []>(url: string | IApiResourceUrlBuilder<A>): IApiResourceReadHook<T, A> {
  const useApiResourceRead = (...args: A): IApiResourceReadState<T> => {
    // Memo
    const builtUrl = useMemo(() => {
      if (typeof url === 'string') {
        return url;
      } else {
        return url(...args);
      }
    }, [url, useDeepMemo(args)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    const { data, loading, reload } = useApi.get<T>(builtUrl);

    // Result
    return {
      data,
      loading,
      reload
    };
  };

  useApiResourceRead.url = url;

  return useApiResourceRead;
}
