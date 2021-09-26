import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { useApi } from './api';
import { ApiPromise } from './api-promise';
import { CombineArg, Updator } from './types';

// Types
export interface IApiResourceGetState<T> {
  loading: boolean;
  data?: T;

  reload: () => void;
  update: (data: T | Updator<T>) => void;
}

export interface IApiResourceDeleteState<T> {
  remove: () => ApiPromise<T>;
}

export type IApiPostMethod = 'patch' | 'post' | 'put';
export type IApiResourcePostState<M extends IApiPostMethod, B, T> = {
  [key in M]: (body: B) => ApiPromise<T>;
}

export type IApiResourceUrlBuilder<A> = A extends void ? string : (arg: A) => string;

export type IApiResourceHookMethods<T, A, S extends IApiResourceGetState<T>> = {
  url: (arg: A) => string;
  delete: <NA = A>(url?: IApiResourceUrlBuilder<NA>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourceDeleteState<T>>;
  patch: <NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourcePostState<'patch', NB, T>>;
  post: <NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourcePostState<'post', NB, T>>;
  put: <NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourcePostState<'put', NB, T>>;
}

export type IApiResourceHook<T, A, S extends IApiResourceGetState<T>> = ((arg: A) => S) & IApiResourceHookMethods<T, A, S>;

// Utils
function hookMethods<T, A, S extends IApiResourceGetState<T>>(url: (arg: A) => string): IApiResourceHookMethods<T, A, S> {
  return {
    url,
    delete<NA = A>(url?: IApiResourceUrlBuilder<NA>) {
      return addDeleteCall<T, CombineArg<A, NA>, S>(this, url as IApiResourceUrlBuilder<CombineArg<A, NA>>);
    },
    patch<NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) {
      return addPostCall<'patch', NB, T, CombineArg<A, NA>, S>('patch', this, url);
    },
    post<NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) {
      return addPostCall<'post', NB, T, CombineArg<A, NA>, S>('post', this, url);
    },
    put<NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) {
      return addPostCall<'put', NB, T, CombineArg<A, NA>, S>('put', this, url);
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
      remove: send
    };
  }

  return Object.assign(useApiResource, hookMethods<T, A, S & IApiResourceDeleteState<T>>(wrapped.url));
}

function addPostCall<M extends IApiPostMethod, B, T, A, S extends IApiResourceGetState<T>>(method: M, wrapped: IApiResourceHook<T, A, S>, url?: IApiResourceUrlBuilder<A>): IApiResourceHook<T, A, S & IApiResourcePostState<M, B, T>> {
  const postUrl: ((arg: A) => string) = url ? (typeof url === 'string' ? () => url : url) : wrapped.url;

  // new hook
  function useApiResource(arg: A): S & IApiResourcePostState<M, B, T> {
    // Memo
    const url = useMemo(() => postUrl(arg), [useDeepMemo(arg)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    const all = wrapped(arg);
    const { send } = useApi[method]<B, T>(url);

    // Result
    return {
      ...all,
      [method]: useCallback((data: B) => {
        return send(data).then((res) => {
          all.update(res);

          return res;
        });
      }, [send, all.update]) // eslint-disable-line react-hooks/exhaustive-deps
    } as S & IApiResourcePostState<M, B, T>;
  }

  return Object.assign(useApiResource, hookMethods<T, A, S & IApiResourcePostState<M, B, T>>(wrapped.url));
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
