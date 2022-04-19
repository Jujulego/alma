import { globalWarehouse } from '@jujulego/alma-resources';

import { ApiResource } from './ApiResource';
import { ApiDataResultEffect, ApiDataResultSuspense, RequestOptions, useApiData } from './hooks';
import { ApiDataConstraint as ADC, ApiResponse, ApiResponseType, ApiResponseTypeFor as ARTF } from './types';
import { ApiUrl, urlBuilder } from './utils';
import { fetcher } from './fetcher';

// Types
export type ApiOptionsEffect<RT extends ApiResponseType> = RequestOptions<RT> & {
  suspense: false;
}

export type ApiOptionsSuspense<RT extends ApiResponseType> = RequestOptions<RT> & {
  suspense?: true;
}

export type ApiOptions<RT extends ApiResponseType> = ApiOptionsEffect<RT> | ApiOptionsSuspense<RT>;

export interface ApiHookEffect<D, A> {
  (arg: A): ApiDataResultEffect<D>;

  // Methods
  prefetch(arg: A): void;
}

export interface ApiHookSuspense<D, A> {
  (arg: A): ApiDataResultSuspense<D>;

  // Methods
  prefetch(arg: A): void;
}

export type ApiHook<D, A> = ApiHookEffect<D, A> | ApiHookSuspense<D, A>;

// Hook builder
export function api<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<'arraybuffer'>): ApiHookEffect<D, A>;
export function api<D extends ADC<'blob'> = ADC<'blob'>, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<'blob'>): ApiHookEffect<D, A>;
export function api<D extends ADC<'json'> = ADC<'json'>, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<'json'>): ApiHookEffect<D, A>;
export function api<D extends ADC<'text'> = ADC<'text'>, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<'text'>): ApiHookEffect<D, A>;

export function api<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>, A = void>(url: ApiUrl<A>, options: ApiOptionsSuspense<'arraybuffer'>): ApiHookSuspense<D, A>;
export function api<D extends ADC<'blob'> = ADC<'blob'>, A = void>(url: ApiUrl<A>, options: ApiOptionsSuspense<'blob'>): ApiHookSuspense<D, A>;
export function api<D extends ADC<'json'> = ADC<'json'>, A = void>(url: ApiUrl<A>, options?: ApiOptionsSuspense<'json'>): ApiHookSuspense<D, A>;
export function api<D extends ADC<'text'> = ADC<'text'>, A = void>(url: ApiUrl<A>, options: ApiOptionsSuspense<'text'>): ApiHookSuspense<D, A>;

export function api<D, A>(url: ApiUrl<A>, options?: ApiOptions<ARTF<D>>): ApiHook<D, A> {
  const builder = urlBuilder(url);

  return Object.assign((arg: A) => useApiData<D>(builder(arg), options), {
    prefetch(arg: A) {
      const warehouse = globalWarehouse();
      const url = builder(arg);

      const id = `useDataApi:${url}`;
      let res = warehouse.get<ApiResponse<D>, ApiResource<D>>(id);

      if (!res) {
        const abort = new AbortController();
        res = new ApiResource<D>(fetcher<D>({
          method: 'get',
          url,
          headers: options?.headers ?? {},
          responseType: (options?.responseType ?? 'json') as ARTF<D>,
        }, abort.signal), abort);

        warehouse.set(id, res);
      }
    }
  });
}
