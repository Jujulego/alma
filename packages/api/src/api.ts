import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useResource } from '@jujulego/alma-resources';

import { ApiResource } from './ApiResource';
import { globalApiConfig } from './config';
import { useApi } from './hooks';
import {
  ApiDataConstraint as ADC, ApiQuery,
  ApiResponse,
  ApiResponseType,
  ApiResponseTypeFor as ARTF,
  EnforceRequestType as ERT, RequestOptions
} from './types';
import { $get, ApiTypedMethod, ApiUrl, urlBuilder } from './utils';

// Types
export interface ApiOptions<RT extends ApiResponseType = ApiResponseType> extends RequestOptions<RT> {
  suspense?: boolean;
}

export interface ApiOptionsEffect<RT extends ApiResponseType = ApiResponseType> extends ApiOptions<RT> {
  suspense: false;
}

export interface ApiOptionsSuspense<RT extends ApiResponseType = ApiResponseType> extends ApiOptions<RT> {
  suspense?: true;
}

export interface ApiHookState<D> {
  isLoading: boolean;
  data: D;
  setData: Dispatch<SetStateAction<D>>;
  refresh(): ApiResource<D>;
}

export type ApiHookMutator<N extends string, DM, BM> = {
  [K in N]: (body: BM) => ApiResource<DM>
}

export interface ApiHook<D, A, M = unknown> {
  (arg: A, query?: ApiQuery): ApiHookState<D> & M;

  // Methods
  prefetch(arg: A, query?: ApiQuery): ApiResource<D>;
  mutation<N extends string, DM, BM>(name: N, method: ApiTypedMethod<DM, BM>, url: string, merge: (old: D, res: DM) => D): ApiHook<D, A, M & ApiHookMutator<N, DM, BM>>
}

// Hook builder
export function api<D = ADC<'arraybuffer'>, A = void>(url: ApiUrl<A>, options: ERT<ApiOptionsEffect, 'arraybuffer'>): ApiHook<D | undefined, A>;
export function api<D = ADC<'blob'>, A = void>(url: ApiUrl<A>, options: ERT<ApiOptionsEffect, 'blob'>): ApiHook<D | undefined, A>;
export function api<D = ADC<'text'>, A = void>(url: ApiUrl<A>, options: ERT<ApiOptionsEffect, 'text'>): ApiHook<D | undefined, A>;
export function api<D, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<ARTF<D>>): ApiHook<D | undefined, A>;

export function api<D = ADC<'arraybuffer'>, A = void>(url: ApiUrl<A>, options: ERT<ApiOptionsSuspense, 'arraybuffer'>): ApiHook<D, A>;
export function api<D = ADC<'blob'>, A = void>(url: ApiUrl<A>, options: ERT<ApiOptionsSuspense, 'blob'>): ApiHook<D, A>;
export function api<D = ADC<'text'>, A = void>(url: ApiUrl<A>, options: ERT<ApiOptionsSuspense, 'text'>): ApiHook<D, A>;
export function api<D, A = void>(url: ApiUrl<A>, options?: ApiOptionsSuspense<ARTF<D>>): ApiHook<D, A>;

export function api<D, A>(url: ApiUrl<A>, options?: ApiOptions<ARTF<D>>): ApiHook<D | undefined, A>;

export function api<D, A>(url: ApiUrl<A>, options: ApiOptions<ARTF<D>> = {}): ApiHook<D | undefined, A> {
  const builder = urlBuilder(url);

  // Options
  const {
    suspense = true,
    query: _query = {},
    headers = {},
    responseType = 'json' as ARTF<D>,
  } = options;

  const config = { ...globalApiConfig(), ...options.config };

  // Hook
  function useApiData(arg: A, query: ApiQuery = {}) {
    const { warehouse } = config;

    // Create resource
    const send = useApi($get<D>(), builder(arg), {
      query: { ..._query, ...query },
      headers, responseType, config
    });

    const key = `api:${url}:${JSON.stringify({ ..._query, ...query })}`;
    const res = useResource(key, { warehouse, creator: send });

    // State
    const [data, setData] = useState<D | undefined>(suspense ? res.read().data : undefined);

    // Effect
    useEffect(() => res?.subscribe(({ data }) => setData(data)), [res]);

    return {
      isLoading: res.status === 'pending',
      data, setData,
      refresh: useCallback(() => {
        if (res.status === 'pending') return res;

        // Refresh data
        const newResource = send();
        warehouse.set(key, newResource);

        return newResource;
      }, [res, warehouse, key, send]),
    };
  }

  return Object.assign(useApiData, {
    prefetch(arg: A, query: ApiQuery = {}) {
      const { fetcher, warehouse } = config;
      const url = builder(arg);

      const id = `api:${url}:${JSON.stringify({ ..._query, ...query })}`;
      let res = warehouse.get<ApiResponse<D>, ApiResource<D>>(id);

      if (!res) {
        const abort = new AbortController();
        res = new ApiResource<D>(fetcher<D>({
          method: 'get',
          url,
          query: { ..._query, ...query },
          headers,
          responseType,
        }, abort.signal), abort);

        warehouse.set(id, res);
      }

      return res;
    },
    mutation<N extends string, DM, BM>(name: N, method: ApiTypedMethod<DM, BM>, url: string, merge: (old: D, res: DM) => D) {
      const useApiDataMutation = (arg: A, query?: ApiQuery) => {
        const state: ApiHookState<D> = this(arg, query);
        const send = useApi<DM, BM, void>(method, builder(arg) + url);

        const { setData } = state;

        return Object.assign(state, {
          [name]: useCallback((body: BM) => send(body)
            .then((result) => {
              setData((old) => merge(old, result.data));
              return result;
            }),
            [send, setData]
          )
        });
      };

      return Object.assign(useApiDataMutation, this);
    }
  });
}
