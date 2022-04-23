import { ApiResource } from './ApiResource';
import { globalApiConfig } from './config';
import {
  ApiDataOptions,
  ApiDataOptionsEffect,
  ApiDataOptionsSuspense,
  ApiDataResult, useApi,
  useApiData
} from './hooks';
import { ApiDataConstraint as ADC, ApiResponse, ApiResponseTypeFor as ARTF, EnforceRequestType as ERT } from './types';
import { ApiTypedMethod, ApiUrl, urlBuilder } from './utils';
import { useCallback } from 'react';

// Types
export interface ApiHook<D, A, M = unknown> {
  (arg: A): ApiDataResult<D> & M;

  // Methods
  prefetch(arg: A): void;
  mutation<N extends string, DM, BM>(name: N, method: ApiTypedMethod<DM, BM>, url: string, merge: (old: D, res: DM) => D): ApiHook<D, A, M & { [K in N]: (body: BM) => ApiResource<DM> }>
}

// Hook builder
export function api<D = ADC<'arraybuffer'>, A = void>(url: ApiUrl<A>, options: ERT<ApiDataOptionsEffect, 'arraybuffer'>): ApiHook<D | undefined, A>;
export function api<D = ADC<'blob'>, A = void>(url: ApiUrl<A>, options: ERT<ApiDataOptionsEffect, 'blob'>): ApiHook<D | undefined, A>;
export function api<D = ADC<'text'>, A = void>(url: ApiUrl<A>, options: ERT<ApiDataOptionsEffect, 'text'>): ApiHook<D | undefined, A>;
export function api<D, A = void>(url: ApiUrl<A>, options: ApiDataOptionsEffect<ARTF<D>>): ApiHook<D | undefined, A>;

export function api<D = ADC<'arraybuffer'>, A = void>(url: ApiUrl<A>, options: ERT<ApiDataOptionsSuspense, 'arraybuffer'>): ApiHook<D, A>;
export function api<D = ADC<'blob'>, A = void>(url: ApiUrl<A>, options: ERT<ApiDataOptionsSuspense, 'blob'>): ApiHook<D, A>;
export function api<D = ADC<'text'>, A = void>(url: ApiUrl<A>, options: ERT<ApiDataOptionsSuspense, 'text'>): ApiHook<D, A>;
export function api<D, A = void>(url: ApiUrl<A>, options?: ApiDataOptionsSuspense<ARTF<D>>): ApiHook<D, A>;

export function api<D, A>(url: ApiUrl<A>, options?: ApiDataOptions<ARTF<D>>): ApiHook<D | undefined, A>;

export function api<D, A>(url: ApiUrl<A>, options: ApiDataOptions<ARTF<D>> = {}): ApiHook<D | undefined, A> {
  const builder = urlBuilder(url);

  // Options
  const {
    headers = {},
    responseType = 'json' as ARTF<D>,
  } = options;

  const config = { ...globalApiConfig(), ...options.config };

  // Propagate defaults
  options.headers = headers;
  options.responseType = responseType;
  options.config = config;

  // Hook
  return Object.assign((arg: A) => useApiData<D>(builder(arg), options), {
    prefetch(arg: A) {
      const { fetcher, warehouse } = config;
      const url = builder(arg);

      const id = `useDataApi:${url}`;
      let res = warehouse.get<ApiResponse<D>, ApiResource<D>>(id);

      if (!res) {
        const abort = new AbortController();
        res = new ApiResource<D>(fetcher<D>({
          method: 'get',
          url,
          headers,
          responseType,
        }, abort.signal), abort);

        warehouse.set(id, res);
      }
    },
    mutation<N extends string, DM, BM>(name: N, method: ApiTypedMethod<DM, BM>, url: string, merge: (old: D, res: DM) => D) {
      return Object.assign((arg: A) => {
        const state: ApiDataResult<D> = this(arg);
        const send = useApi<DM, BM, void>(method, builder(arg) + url);

        const { setData } = state;

        return Object.assign(state, {
          [name]: useCallback((body: BM) => {
            const res = send(body);
            res.then(({ data }) => setData((old) => merge(old, data)));

            return res;
          }, [send, setData])
        });
      }, this);
    }
  });
}
