import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { ApiAutoLoadState, ApiLoadableHook, useApiAutoLoad } from './api';
import { ApiPromise } from './api-promise';
import { ApiResponse } from './types';

// Types
export type ApiUrlBuilder<A> = (args: A) => string;
export type ApiMerge<D, DM> = (state: D | undefined, res: DM) => D | undefined;

export interface ApiQueryableHookState<D> {
  loading: boolean;
  send: (url?: string) => ApiPromise<ApiResponse<D>>;
}

export type ApiQueryableHook<D> = (url: string) => ApiQueryableHookState<D>

export type ApiStateQueryMethod<N extends string, DM, AM> = {
  [key in N]: (args: AM) => ApiPromise<ApiResponse<DM>>
}

export type ApiHook<D, A, S extends ApiAutoLoadState<D>> = ((args: A) => S) & ApiHookMethods<D, A, S>;

export interface ApiHookMethods<D, A, S extends ApiAutoLoadState<D>> {
  query<N extends string, DM = D, AM = void>(name: N, hook: ApiQueryableHook<DM>, url: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>): ApiHook<D, A, S & ApiStateQueryMethod<N, DM, AM>>;
}

// Utils
function hookMethods<D, A, S extends ApiAutoLoadState<D>>(url: ApiUrlBuilder<A>): ApiHookMethods<D, A, S> {
  return {
    query<N extends string, DM, AM>(name: N, hook: ApiQueryableHook<DM>, builder: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>) {
      return addQueryCall<N, D, DM, A, AM, S>(url, this, name, hook, builder, merge);
    }
  };
}

// Hook modifier
function addQueryCall<N extends string, D, DM, A, AM, S extends ApiAutoLoadState<D>>(defaultBuilder: ApiUrlBuilder<A>, wrapped: ApiHook<D, A, S>, name: N, hook: ApiQueryableHook<DM>, builder: null | string | ApiUrlBuilder<AM>, merge: ApiMerge<D, DM>): ApiHook<D, A, S & ApiStateQueryMethod<N, DM, AM>> {
  // Hook
  function useApiResource(args: A): S & ApiStateQueryMethod<N, DM, AM> {
    // Url
    const sargs = useDeepMemo(args);
    const defaultUrl = useMemo(() => defaultBuilder(sargs), [sargs]);

    // Api
    const { send } = hook(defaultUrl);
    const all = wrapped(args);

    // Result
    const { update } = all;

    return Object.assign(all, {
      [name]: useCallback((args: AM) => {
        const url = typeof builder === 'function' ? builder(args) : builder || undefined;

        return send(url).then((res) => {
          update(old => merge(old, res.data));
          return res;
        });
      }, [send, update]),
    } as ApiStateQueryMethod<N, DM, AM>);
  }

  return Object.assign(useApiResource, hookMethods<D, A, S & ApiStateQueryMethod<N, DM, AM>>(defaultBuilder));
}

// Hook builder
export function apiResource<D, A = void>(hook: ApiLoadableHook<D>, url: string | ApiUrlBuilder<A>): ApiHook<D, A, ApiAutoLoadState<D>> {
  const builder = typeof url === 'string' ? () => url : url;

  // Hook
  function useApiResource(args: A): ApiAutoLoadState<D> {
    // Url
    const sargs = useDeepMemo(args);
    const url = useMemo(() => builder(sargs), [sargs]);

    // Api
    return useApiAutoLoad<D>(hook, url);
  }

  return Object.assign(useApiResource, hookMethods<D, A, ApiAutoLoadState<D>>(builder));
}