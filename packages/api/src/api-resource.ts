import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { ApiGetReturn, useApi } from './api';
import { ApiPromise } from './api-promise';
import { ApiResult, CombineArg } from './types';

// Types
export interface IApiResourceDeleteState<T> {
  remove: () => ApiPromise<ApiResult<T>>;
}

export type IApiPostMethod = 'patch' | 'post' | 'put';
export type IApiResourcePostState<M extends IApiPostMethod, B, T> = {
  [key in M]: (body: B) => ApiPromise<ApiResult<T>>;
}

export type IApiResourceUrlBuilder<A> = A extends void ? string : (arg: A) => string;

export type IApiResourceHookMethods<T, A, S extends ApiGetReturn<T>> = {
  url: (arg: A) => string;
  delete: <NA = A>(url?: IApiResourceUrlBuilder<NA>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourceDeleteState<T>>;
  patch: <NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourcePostState<'patch', NB, T>>;
  post: <NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourcePostState<'post', NB, T>>;
  put: <NB, NA = A>(url?: IApiResourceUrlBuilder<CombineArg<A, NA>>) => IApiResourceHook<T, CombineArg<A, NA>, S & IApiResourcePostState<'put', NB, T>>;
}

export type IApiResourceHook<T, A, S extends ApiGetReturn<T>> = ((arg: A) => S) & IApiResourceHookMethods<T, A, S>;

// Utils
function hookMethods<T, A, S extends ApiGetReturn<T>>(url: (arg: A) => string): IApiResourceHookMethods<T, A, S> {
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
function addDeleteCall<T, A, S extends ApiGetReturn<T>>(wrapped: IApiResourceHook<T, A, S>, url?: IApiResourceUrlBuilder<A>): IApiResourceHook<T, A, S & IApiResourceDeleteState<T>> {
  const deleteUrl: ((arg: A) => string) = url ? (typeof url === 'string' ? () => url : url) : wrapped.url;

  // new hook
  function useApiResource(arg: A): S & IApiResourceDeleteState<T> {
    // Memo
    const url = useMemo(() => deleteUrl(arg), [useDeepMemo(arg)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    const all = wrapped(arg);
    const { send } = useApi.delete<T>(url);

    // Result
    const { update } = all;

    return {
      ...all,
      remove: useCallback(() => {
        return send().then((res) => {
          if (res.data) update(res.data);
          return res;
        });
      }, [send, update])
    };
  }

  return Object.assign(useApiResource, hookMethods<T, A, S & IApiResourceDeleteState<T>>(wrapped.url));
}

function addPostCall<M extends IApiPostMethod, B, T, A, S extends ApiGetReturn<T>>(method: M, wrapped: IApiResourceHook<T, A, S>, url?: IApiResourceUrlBuilder<A>): IApiResourceHook<T, A, S & IApiResourcePostState<M, B, T>> {
  const postUrl: ((arg: A) => string) = url ? (typeof url === 'string' ? () => url : url) : wrapped.url;

  // new hook
  function useApiResource(arg: A): S & IApiResourcePostState<M, B, T> {
    // Memo
    const url = useMemo(() => postUrl(arg), [useDeepMemo(arg)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    const all = wrapped(arg);
    const { send } = useApi[method]<B, T>(url);

    // Result
    const { update } = all;

    return {
      ...all,
      [method]: useCallback((data: B) => {
        return send(data).then((res) => {
          if (res.data) update(res.data);
          return res;
        });
      }, [send, update])
    } as S & IApiResourcePostState<M, B, T>;
  }

  return Object.assign(useApiResource, hookMethods<T, A, S & IApiResourcePostState<M, B, T>>(wrapped.url));
}

// Hook builder
export function apiResource<T, A = void>(url: IApiResourceUrlBuilder<A>): IApiResourceHook<T, A, ApiGetReturn<T>> {
  const getUrl: (arg: A) => string = typeof url === 'string' ? () => url : url;

  // hook
  function useApiResource(arg: A): ApiGetReturn<T> {
    // Memo
    const url = useMemo(() => getUrl(arg), [useDeepMemo(arg)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Api
    return useApi.get<T>(url);
  }

  return Object.assign(useApiResource, hookMethods<T, A, ApiGetReturn<T>>(getUrl));
}
