import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { ApiAutoLoadState, ApiLoadableHook, useApiAutoLoad } from './api';
import { ApiPromise } from './api-promise';
import { ApiResponse, ApiResponseType, ApiRTConstraint } from './types';

// Types
export type ApiUrlBuilder<A> = (args: A) => string;
export type ApiMerge<D, DM> = (state: D | undefined, res: DM) => D | undefined;

export interface ApiQueryableHookState<T extends ApiResponseType, D extends ApiRTConstraint[T]> {
  loading: boolean;
  send: (url?: string) => ApiPromise<ApiResponse<T, D>>;
}

export type ApiQueryableHook<T extends ApiResponseType, D extends ApiRTConstraint[T]> = (url: string) => ApiQueryableHookState<T, D>

export type ApiStateQueryMethod<N extends string, T extends ApiResponseType, DM extends ApiRTConstraint[T], AM> = {
  [key in N]: (args: AM) => ApiPromise<ApiResponse<T, DM>>
}

export interface ApiMutableHookState<T extends ApiResponseType, B, D extends ApiRTConstraint[T]> {
  loading: boolean;
  send: (body: B, url?: string) => ApiPromise<ApiResponse<T, D>>;
}

export type ApiMutableHook<T extends ApiResponseType, B, D extends ApiRTConstraint[T]> = (url: string) => ApiMutableHookState<T, B, D>

export type ApiStateMutateMethod<N extends string, T extends ApiResponseType, BM, DM extends ApiRTConstraint[T], AM> = {
  [key in N]: (body: BM, args: AM) => ApiPromise<ApiResponse<T, DM>>
}

export type ApiHook<T extends ApiResponseType, D extends ApiRTConstraint[T], A, S extends ApiAutoLoadState<D, T>> = ((args: A) => S) & ApiHookMethods<T, D, A, S>;

export interface ApiHookMethods<T extends ApiResponseType, D extends ApiRTConstraint[T], A, S extends ApiAutoLoadState<D, T>> {
  query<N extends string, DM extends ApiRTConstraint[T] = D, AM = void>(name: N, hook: ApiQueryableHook<T, DM>, url: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>): ApiHook<T, D, A, S & ApiStateQueryMethod<N, T, DM, AM>>;
  mutate<N extends string, BM, DM extends ApiRTConstraint[T] = D, AM = void>(name: N, hook: ApiMutableHook<T, BM, DM>, url: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>): ApiHook<T, D, A, S & ApiStateMutateMethod<N, T, BM, DM, AM>>;
}

// Utils
function hookMethods<T extends ApiResponseType, D extends ApiRTConstraint[T], A, S extends ApiAutoLoadState<D, T>>(url: ApiUrlBuilder<A>): ApiHookMethods<T, D, A, S> {
  return {
    query<N extends string, DM extends ApiRTConstraint[T], AM>(name: N, hook: ApiQueryableHook<T, DM>, builder: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>) {
      return addQueryCall<N, T, D, DM, A, AM, S>(url, this, name, hook, builder, merge);
    },
    mutate<N extends string, BM, DM extends ApiRTConstraint[T], AM>(name: N, hook: ApiMutableHook<T, BM, DM>, builder: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>) {
      return addMutationCall<N, T, BM, D, DM, A, AM, S>(url, this, name, hook, builder, merge);
    },
  };
}

// Hook modifier
function addQueryCall<N extends string, T extends ApiResponseType, D extends ApiRTConstraint[T], DM extends ApiRTConstraint[T], A, AM, S extends ApiAutoLoadState<D, T>>(defaultBuilder: ApiUrlBuilder<A>, wrapped: ApiHook<T, D, A, S>, name: N, hook: ApiQueryableHook<T, DM>, builder: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>): ApiHook<T, D, A, S & ApiStateQueryMethod<N, T, DM, AM>> {
  // Hook
  function useApiResource(args: A): S & ApiStateQueryMethod<N, T, DM, AM> {
    // Url
    const sargs = useDeepMemo(args);
    const defaultUrl = useMemo(() => defaultBuilder(sargs), [sargs]);

    // Api
    const { send } = hook(defaultUrl);
    const all = wrapped(args);

    // Result
    const { setData } = all;

    return Object.assign(all, {
      [name]: useCallback((args: AM) => {
        const url = typeof builder === 'function' ? builder(args) : builder || undefined;

        return send(url).then((res) => {
          setData((old) => merge(old, res.data));
          return res;
        });
      }, [send, setData]),
    } as ApiStateQueryMethod<N, T, DM, AM>);
  }

  return Object.assign(useApiResource, hookMethods<T, D, A, S & ApiStateQueryMethod<N, T, DM, AM>>(defaultBuilder));
}

function addMutationCall<N extends string, T extends ApiResponseType, BM, D extends ApiRTConstraint[T], DM extends ApiRTConstraint[T], A, AM, S extends ApiAutoLoadState<D, T>>(defaultBuilder: ApiUrlBuilder<A>, wrapped: ApiHook<T, D, A, S>, name: N, hook: ApiMutableHook<T, BM, DM>, builder: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>): ApiHook<T, D, A, S & ApiStateMutateMethod<N, T, BM, DM, AM>> {
  // Hook
  function useApiResource(args: A): S & ApiStateMutateMethod<N, T, BM, DM, AM> {
    // Url
    const sargs = useDeepMemo(args);
    const defaultUrl = useMemo(() => defaultBuilder(sargs), [sargs]);

    // Api
    const { send } = hook(defaultUrl);
    const all = wrapped(args);

    // Result
    const { setData } = all;

    return Object.assign(all, {
      [name]: useCallback((body: BM, args: AM) => {
        const url = typeof builder === 'function' ? builder(args) : builder || undefined;

        return send(body, url).then((res) => {
          setData((old) => merge(old, res.data));
          return res;
        });
      }, [send, setData]),
    } as ApiStateMutateMethod<N, T, BM, DM, AM>);
  }

  return Object.assign(useApiResource, hookMethods<T, D, A, S & ApiStateMutateMethod<N, T, BM, DM, AM>>(defaultBuilder));
}

// Hook builder
export function apiResource<T extends ApiResponseType, D extends ApiRTConstraint[T] = ApiRTConstraint[T], A = void>(hook: ApiLoadableHook<D, T>, url: string | ApiUrlBuilder<A>, responseType: T): ApiHook<T, D, A, ApiAutoLoadState<D, T>> {
  const builder = typeof url === 'string' ? () => url : url;

  // Hook
  function useApiResource(args: A): ApiAutoLoadState<D, T> {
    // Url
    const sargs = useDeepMemo(args);
    const url = useMemo(() => builder(sargs), [sargs]);

    // Api
    return useApiAutoLoad<D, T>(hook, url, { responseType });
  }

  return Object.assign(useApiResource, hookMethods<T, D, A, ApiAutoLoadState<D, T>>(builder));
}
