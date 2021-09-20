import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { useApi } from './api';
import { CombineArg, Updator } from './types';

// Types
export interface IApiResourceGetState<T> {
  loading: boolean;
  data?: T;

  reload: () => void;
  update: (data: T | Updator<T>) => void;
}

export interface IApiResourceDeleteState<T> {
  remove: () => Promise<T>; // TODO: should be an ApiPromise
}

export interface IApiResourcePutState<B, T> {
  put: (body: B) => Promise<T>; // TODO: should be an ApiPromise
}

export type IApiResourceUrlBuilder<A> = A extends void ? string : (arg: A) => string;

export type IApiResourceHookMethods<T, A, S extends IApiResourceGetState<T>> = {
  url: (arg: A) => string;
  delete: <NA = A>(url?: IApiResourceUrlBuilder<NA>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourceDeleteState<T>>;
  put: <NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourcePutState<NB, T>>;
}

export type IApiResourceHook<T, A, S extends IApiResourceGetState<T>> = ((arg: A) => S) & IApiResourceHookMethods<T, A, S>;

// Utils
function hookMethods<T, A, S extends IApiResourceGetState<T>>(url: (arg: A) => string): IApiResourceHookMethods<T, A, S> {
  return {
    url,
    delete<NA = A>(url?: IApiResourceUrlBuilder<NA>) {
      return addDeleteCall<T, CombineArg<A, NA>, S>(this, url as IApiResourceUrlBuilder<CombineArg<A, NA>>);
    },
    put<NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) {
      return addPutCall<NB, T, CombineArg<A, NA>, S>(this, url);
    }
  };
}

// Hook modifiers
function addDeleteCall<T, A, S extends IApiResourceGetState<T>>(wrapped: IApiResourceHook<T, A, S>, url?: IApiResourceUrlBuilder<A>): IApiResourceHook<T, A, S & IApiResourceDeleteState<T>> {
  const deleteUrl: ((arg: A) => string) = url ? (typeof url === 'string' ? () => url : url) : wrapped.url;

  // new hook
  function useApiResource(arg: A): S & IApiResourceDeleteState<T> {
    // Memo
    const url = useMemo(() => deleteUrl(arg), [useDeepMemo(arg)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    const all = wrapped(arg);
    const { send } = useApi.delete<T>(url);

    // Result
    return {
      ...all,
      remove: useCallback(async () => {
        const res = await send();
        all.update(res);

        return res;
      }, [send, all.update]) // eslint-disable-line react-hooks/exhaustive-deps
    };
  }

  return Object.assign(useApiResource, hookMethods<T, A, S & IApiResourceDeleteState<T>>(wrapped.url));
}

function addPutCall<B, T, A, S extends IApiResourceGetState<T>>(wrapped: IApiResourceHook<T, A, S>, url?: IApiResourceUrlBuilder<A>): IApiResourceHook<T, A, S & IApiResourcePutState<B, T>> {
  const putUrl: ((arg: A) => string) = url ? (typeof url === 'string' ? () => url : url) : wrapped.url;

  // new hook
  function useApiResource(arg: A): S & IApiResourcePutState<B, T> {
    // Memo
    const url = useMemo(() => putUrl(arg), [useDeepMemo(arg)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    const all = wrapped(arg);
    const { send } = useApi.put<B, T>(url);

    // Result
    return {
      ...all,
      put: useCallback(async (data: B) => {
        const res = await send(data);
        all.update(res);

        return res;
      }, [send, all.update]) // eslint-disable-line react-hooks/exhaustive-deps
    };
  }

  return Object.assign(useApiResource, hookMethods<T, A, S & IApiResourcePutState<B, T>>(wrapped.url));
}

// Hook builder
export function apiResource<T, A = void>(url: IApiResourceUrlBuilder<A>): IApiResourceHook<T, A, IApiResourceGetState<T>> {
  const getUrl: (arg: A) => string = typeof url === 'string' ? () => url : url;

  // hook
  function useApiResource(arg: A): IApiResourceGetState<T> {
    // Memo
    const url = useMemo(() => getUrl(arg), [useDeepMemo(arg)]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return Object.assign(useApiResource, hookMethods<T, A, IApiResourceGetState<T>>(getUrl));
}
