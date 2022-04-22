import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useContext } from 'react';

import { ApiResource } from '../ApiResource';
import { ApiConfig, ApiConfigContext } from '../config';
import {
  ApiDataConstraint as ADC,
  ApiMethod, ApiMutationMethod, ApiQueryMethod, ApiResponseType,
  ApiResponseTypeFor as ARTF,
  EnforceRequestType as ERT,
  RequestOptions
} from '../types';
import { ApiUrl } from '../utils';
import { useApiUrl } from './useApiUrl';

// Types
export interface ApiOptions<RT extends ApiResponseType = ApiResponseType> extends RequestOptions<RT> {
  config?: Partial<ApiConfig>;
}

export type QuerySender<A, D> = A extends void ? () => ApiResource<D> : (arg: A) => ApiResource<D>;
export type MutationSender<A, B, D> = A extends void ? (body: B) => ApiResource<D> : (arg: A, body: B) => ApiResource<D>;
export type RequestSender<A, B, D> = A extends void ? (body?: B) => ApiResource<D> : (arg: A, body?: B) => ApiResource<D>;

// Hook
export function useApi<D = ADC<'arraybuffer'>, A = void>(method: ApiQueryMethod, url: ApiUrl<A>, options: ERT<ApiOptions, 'arraybuffer'>): QuerySender<A, D>;
export function useApi<D = ADC<'blob'>, A = void>(method: ApiQueryMethod, url: ApiUrl<A>, options: ERT<ApiOptions, 'blob'>): QuerySender<A, D>;
export function useApi<D = ADC<'text'>, A = void>(method: ApiQueryMethod, url: ApiUrl<A>, options: ERT<ApiOptions, 'text'>): QuerySender<A, D>;
export function useApi<D, A = void>(method: ApiQueryMethod, url: ApiUrl<A>, options?: ApiOptions<ARTF<D>>): QuerySender<A, D>;

export function useApi<B, D = ADC<'arraybuffer'>, A = void>(method: ApiMutationMethod, url: ApiUrl<A>, options: ERT<ApiOptions, 'arraybuffer'>): MutationSender<A, B, D>;
export function useApi<B, D = ADC<'blob'>, A = void>(method: ApiMutationMethod, url: ApiUrl<A>, options: ERT<ApiOptions, 'blob'>): MutationSender<A, B, D>;
export function useApi<B, D = ADC<'text'>, A = void>(method: ApiMutationMethod, url: ApiUrl<A>, options: ERT<ApiOptions, 'text'>): MutationSender<A, B, D>;
export function useApi<B, D, A = void>(method: ApiMutationMethod, url: ApiUrl<A>, options?: ApiOptions<ARTF<D>>): MutationSender<A, B, D>;

export function useApi<B, D, A>(method: ApiMethod, url: ApiUrl<A>, options: ApiOptions<ARTF<D>> = {}): RequestSender<A, B, D> {
  const { headers = {}, responseType = 'json' as ARTF<D>, config: optConfig = {} } = options;

  // Contexts
  const ctxConfig = useContext(ApiConfigContext);

  // Memos
  const _headers = useDeepMemo(headers);
  const _url = useApiUrl(url);

  // Callbacks
  const { fetcher = ctxConfig.fetcher } = optConfig;

  return useCallback((...args: unknown[]) => {
    // Parse arguments
    let arg: A | void;
    let body: B | undefined = undefined;

    if (args.length >= 2) {
      [arg, body] = args as [A, B];
    } else if (_url.length === 0) {
      [body] = args as [B];
    } else {
      [arg] = args as [A];
    }

    // Send request
    const abort = new AbortController();
    const promise = fetcher<D>({
      method,
      url: arg === undefined ? (_url as () => string)() : _url(arg),
      headers: _headers,
      body,
      responseType,
    }, abort.signal);

    return new ApiResource<D>(promise, abort);
  }, [fetcher, method, _url, _headers, responseType]) as RequestSender<A, B, D>;
}
