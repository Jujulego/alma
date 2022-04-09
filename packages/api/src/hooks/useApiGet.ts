import { ApiDataConstraint, ApiHeaders, ApiResponseType, ApiResponseTypeFor } from '../types';
import { ApiUrl, normalizeUrl } from '../utils';
import { ApiResource } from '../ApiResource';
import { useApiRequest } from './useApiRequest';
import { useDeepMemo } from '@jujulego/alma-utils/src';
import { useCallback, useMemo } from 'react';

// Types
interface UseApiGetOptionsBase {
  headers?: ApiHeaders;
}

interface UseApiGetOptionsJson extends UseApiGetOptionsBase {
  responseType?: 'json';
}

interface UseApiGetOptionsOthers<RT extends ApiResponseType> extends UseApiGetOptionsBase {
  responseType: RT;
}

export type UseApiGetOptions<RT extends ApiResponseType> = RT extends 'json' ? UseApiGetOptionsJson : UseApiGetOptionsOthers<RT>;

export interface UseApiGetProps<D, A extends unknown[] = []> {
  send(...args: A): ApiResource<D>;
}

// Hook
export function useApiGet<D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>, A extends unknown[] = []>(url: ApiUrl<A>, options: UseApiGetOptions<'arraybuffer'>): UseApiGetProps<D, A>;
export function useApiGet<D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>, A extends unknown[] = []>(url: ApiUrl<A>, options: UseApiGetOptions<'blob'>): UseApiGetProps<D, A>;
export function useApiGet<D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>, A extends unknown[] = []>(url: ApiUrl<A>, options?: UseApiGetOptions<'json'>): UseApiGetProps<D, A>;
export function useApiGet<D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>, A extends unknown[] = []>(url: ApiUrl<A>, options: UseApiGetOptions<'text'>): UseApiGetProps<D, A>;
export function useApiGet<D, A extends unknown[] = []>(url: ApiUrl<A>, options?: UseApiGetOptions<ApiResponseTypeFor<D>>): UseApiGetProps<D, A> {
  const { headers = {}, responseType = 'json' } = options ?? {};

  // Stabilize objects
  const _headers = useDeepMemo(headers);
  const _url = useMemo(() => normalizeUrl(url), [url]);

  // Api
  const { request } = useApiRequest();

  // Callback
  const send = useCallback((...args: A) => request<'get', D>({
    method: 'get',
    url: _url(...args),
    headers: _headers,
    responseType: responseType as ApiResponseTypeFor<D>,
  }), [_url, _headers, responseType, request]);

  return { send };
}
