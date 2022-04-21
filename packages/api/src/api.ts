import { globalWarehouse } from '@jujulego/alma-resources';

import { ApiResource } from './ApiResource';
import {
  ApiDataOptions,
  ApiDataOptionsEffect,
  ApiDataOptionsSuspense,
  ApiDataResult,
  useApiData
} from './hooks';
import { ApiDataConstraint as ADC, ApiResponse, ApiResponseTypeFor as ARTF, EnforceRequestType as ERT } from './types';
import { ApiUrl, urlBuilder } from './utils';
import { fetcher } from './fetcher';

// Types
export interface ApiHook<D, A> {
  (arg: A): ApiDataResult<D>;

  // Methods
  prefetch(arg: A): void;
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
    warehouse = globalWarehouse(),
  } = options;

  // Propagate defaults
  options.headers = headers;
  options.responseType = responseType;
  options.warehouse = warehouse;

  // Hook
  return Object.assign((arg: A) => useApiData<D>(builder(arg), options), {
    prefetch(arg: A) {
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
    }
  });
}
