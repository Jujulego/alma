import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { AbortResource, useResource } from '@jujulego/alma-resources';

import { globalApiConfig } from './config';
import { useApi } from './hooks';
import {
  ApiDataConstraint as ADC, ApiMethod, ApiQuery, ApiResource,
  ApiResponse,
  ApiResponseType,
  ApiResponseTypeFor as ARTF,
  EnforceRequestType as ERT, RequestOptions
} from './types';
import { ApiTypedMethod, ApiUrl, ApiUrlBuilder, urlBuilder } from './utils';

// Types
export type ApiKeyBuilder<B> = (req: { method: ApiMethod, url: string, query: ApiQuery, body?: B }) => string;

export interface ApiOptions<B, RT extends ApiResponseType = ApiResponseType> extends RequestOptions<RT> {
  key?: string | ApiKeyBuilder<B>;
  suspense?: boolean;
}

export interface ApiOptionsSuspense<B, RT extends ApiResponseType = ApiResponseType> extends ApiOptions<B, RT> {
  suspense: true;
}

export interface ApiOptionsEffect<B, RT extends ApiResponseType = ApiResponseType> extends ApiOptions<B, RT> {
  suspense?: false;
}

export interface ApiHookState<D> {
  isLoading: boolean;
  data: D;
  setData: Dispatch<SetStateAction<D>>;
  refresh(): ApiResource<D>;
}

export type ApiHookSender<A, B, R> = A extends void
  ? (body?: B, query?: ApiQuery) => R
  : (arg: A, body?: B, query?: ApiQuery) => R;

export type ApiHookMutator<N extends string, DM, BM> = {
  [K in N]: (body: BM, query?: ApiQuery) => ApiResource<DM>
}

export type ApiHook<A, B, D, M = unknown> = ApiHookSender<A, B, ApiHookState<D> & M> & {
  // Methods
  prefetch: ApiHookSender<A, B, ApiResource<D>>;
  mutation<N extends string, DM, BM>(name: N, method: ApiTypedMethod<DM, BM>, url: string, merge: (old: D, res: DM) => D): ApiHook<A, B, D, M & ApiHookMutator<N, DM, BM>>
};

// Utils
function extractKeyBuilder<B>(options: ApiOptions<B>): ApiKeyBuilder<B> {
  const { key } = options;

  if (typeof key === 'string') {
    return () => key;
  } else {
    return key ?? (({ method, url, query }) => `$api:${method}:${url}:${JSON.stringify(query)}`);
  }
}

function parseArgs<A, B>(builder: ApiUrlBuilder<A>, args: unknown[]): [string, B | undefined, ApiQuery] {
  // Parse arguments
  let arg: A | void;
  let body: B | undefined;
  let query: ApiQuery;

  if (builder.length === 0) {
    [body, query = {}] = args as [B | undefined, ApiQuery | undefined];
  } else {
    [arg, body, query = {}] = args as [A, B | undefined, ApiQuery | undefined];
  }

  return [arg === undefined ? (builder as () => string)() : builder(arg), body, query];
}

// Hook builder
export function $api<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<ApiOptionsSuspense<B>, 'arraybuffer'>): ApiHook<A, B, D & ADC<'arraybuffer'>>;
export function $api<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<ApiOptionsSuspense<B>, 'blob'>): ApiHook<A, B, D & ADC<'blob'>>;
export function $api<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<ApiOptionsSuspense<B>, 'text'>): ApiHook<A, B, D & ADC<'text'>>;
export function $api<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ApiOptionsSuspense<B, ARTF<D>>): ApiHook<A, B, D>;

export function $api<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<ApiOptionsEffect<B>, 'arraybuffer'>): ApiHook<A, B, (D & ADC<'arraybuffer'>) | undefined>;
export function $api<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<ApiOptionsEffect<B>, 'blob'>): ApiHook<A, B, (D & ADC<'blob'>) | undefined>;
export function $api<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ERT<ApiOptionsEffect<B>, 'text'>): ApiHook<A, B, (D & ADC<'text'>) | undefined>;
export function $api<D, B = unknown, A = void>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options?: ApiOptionsEffect<B, ARTF<D>>): ApiHook<A, B, D | undefined>;

export function $api<D, B, A>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options?: ApiOptions<B, ARTF<D>>): ApiHook<A, B, D | undefined>;

export function $api<D, B, A>(method: ApiTypedMethod<D, B>, url: ApiUrl<A>, options: ApiOptions<B, ARTF<D>> = {}): ApiHook<A, B, D | undefined> {
  const builder = urlBuilder(url);

  // Options
  const {
    suspense = false,
    query: _query = {},
    headers = {},
    responseType = 'json' as ARTF<D>,
  } = options;

  const keyBuilder = extractKeyBuilder(options);
  const config = { ...globalApiConfig(), ...options.config };

  // Hook
  function useApiData(...args: unknown[]) {
    const [url, body, query] = parseArgs<A, B>(builder, args);
    const { warehouse } = config;

    // Create resource
    const send = useApi(method, url, {
      query: _query,
      headers, responseType, config
    });

    const key = useMemo(() => keyBuilder({ method, url, query: { ..._query, ...query }, body} ), [url, query, body]);
    const res = useResource(key, { warehouse, creator: () => send(body, query) });

    // State
    const [data, setData] = useState<D | undefined>(suspense ? res.read().data : undefined);

    // Effect
    useEffect(() => res?.subscribe(({ data }) => setData(data)), [res]);

    return {
      isLoading: res.status === 'pending',
      data, setData,
      refresh: useCallback(() => {
        if (res.status === 'pending') {
          return res;
        }

        // Refresh data
        const newResource = send(body, query);
        warehouse.set(key, newResource);

        return newResource;
      }, [res, warehouse, key, body, query, send]),
    };
  }

  return Object.assign(useApiData, {
    prefetch(...args: unknown[]) {
      const [url, body, query] = parseArgs<A, B>(builder, args);
      const { fetcher, warehouse } = config;

      const key = keyBuilder({ method, url, query: { ..._query, ...query }, body});
      let res = warehouse.get<ApiResponse<D>, ApiResource<D>>(key);

      if (!res) {
        const abort = new AbortController();
        res = new AbortResource<ApiResponse<D>>(fetcher<D>({
          method, url,
          query: { ..._query, ...query },
          headers, body,
          responseType,
        }, abort.signal), abort);

        warehouse.set(key, res);
      }

      return res;
    },
    mutation<N extends string, DM, BM>(name: N, method: ApiTypedMethod<DM, BM>, url: string, merge: (old: D, res: DM) => D) {
      const useApiDataMutation = (...args: unknown[]) => {
        const [_url,] = parseArgs<A, B>(builder, args);
        const state: ApiHookState<D> = this(...args);

        const send = useApi<DM, BM, void>(method, _url + url);

        const { setData } = state;

        return Object.assign(state, {
          [name]: useCallback((body: BM, query?: ApiQuery) => send(body, query)
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
  }) as ApiHook<A, B, D>;
}
