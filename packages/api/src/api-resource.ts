import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { useApi } from './api';
import { Updator } from './types';

// Types
export interface IApiResourceGetState<T> {
  loading: boolean;
  data?: T;

  reload: () => void;
  update: (data: T | Updator<T>) => void;
}

export interface IApiResourcePutState<Put, T> {
  put: (body: Put) => Promise<T> // TODO: should be an ApiPromise
}

export type IApiResourceUrlBuilder<A extends unknown[]> = (...args: A) => string;

export type IApiResourceHookMethods<T, A extends unknown[], S extends IApiResourceGetState<T>> = {
  url: IApiResourceUrlBuilder<A>;
  put: <Put>() => IApiResourceHook<T, A, S & IApiResourcePutState<Put, T>>
}

export type IApiResourceHook<T, A extends unknown[], S extends IApiResourceGetState<T>> = ((...args: A) => S) & IApiResourceHookMethods<T, A, S>;

// Hook modifiers
function addPutCall<Put, T, A extends unknown[], S extends IApiResourceGetState<T>>(hook: IApiResourceHook<T, A, S>): IApiResourceHook<T, A, S & IApiResourcePutState<Put, T>> {
  function useApiResource(...args: A): S & IApiResourcePutState<Put, T> {
    // Memo
    const url = useMemo(() => hook.url(...args), [useDeepMemo(args)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    const all = hook(...args);
    const { send } = useApi.put<Put, T>(url);

    // Result
    return {
      ...all,
      put: useCallback(async (data: Put) => {
        const res = await send(data);
        all.update(res);

        return res;
      }, [send, all.update])
    };
  }

  return Object.assign(useApiResource, hook);
}

// Hook builder
export function apiResource<T, A extends unknown[] = []>(url: string | IApiResourceUrlBuilder<A>): IApiResourceHook<T, A, IApiResourceGetState<T>> {
  const hook: IApiResourceHookMethods<T, A, IApiResourceGetState<T>> = {
    url: typeof url === 'string' ? () => url : url,
    put<Put, S extends IApiResourceGetState<T>>() {
      return addPutCall<Put, T, A, S>(this);
    }
  };

  function useApiResource(...args: A): IApiResourceGetState<T> {
    // Memo
    const url = useMemo(() => hook.url(...args), [useDeepMemo(args)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    const { data, loading, reload, update } = useApi.get<T>(url);

    // Result
    return {
      data,
      loading,
      reload,
      update
    };
  }

  return Object.assign(useApiResource, hook);
}