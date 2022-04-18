import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback } from 'react';

import { ApiResource } from '../ApiResource';
import {
  ApiDataConstraint as ADC,
  ApiHeaders,
  ApiMethod,
  ApiResponseType,
  ApiResponseTypeFor as ARTF,
  RequestTypeOption
} from '../types';
import { useApiRequest } from './useApiRequest';

// Types
export type RequestOptions<RT extends ApiResponseType> = RequestTypeOption<RT> & {
  headers?: ApiHeaders;
};

// Hook
export function useApi<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(method: 'get' | 'head' | 'options' | 'delete', url: string, options: RequestOptions<'arraybuffer'>): () => ApiResource<D>;
export function useApi<D extends ADC<'blob'> = ADC<'blob'>>(method: 'get' | 'head' | 'options' | 'delete', url: string, options: RequestOptions<'blob'>): () => ApiResource<D>;
export function useApi<D extends ADC<'json'> = ADC<'json'>>(method: 'get' | 'head' | 'options' | 'delete', url: string, options?: RequestOptions<'json'>): () => ApiResource<D>;
export function useApi<D extends ADC<'text'> = ADC<'text'>>(method: 'get' | 'head' | 'options' | 'delete', url: string, options: RequestOptions<'text'>): () => ApiResource<D>;
export function useApi<D>(method: 'get' | 'head' | 'options' | 'delete', url: string, options?: RequestOptions<ARTF<D>>): () => ApiResource<D>;

export function useApi<B, D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(method: 'post' | 'patch' | 'put', url: string, options: RequestOptions<'arraybuffer'>): (body: B) => ApiResource<D>;
export function useApi<B, D extends ADC<'blob'> = ADC<'blob'>>(method: 'post' | 'patch' | 'put', url: string, options: RequestOptions<'blob'>): (body: B) => ApiResource<D>;
export function useApi<B, D extends ADC<'json'> = ADC<'json'>>(method: 'post' | 'patch' | 'put', url: string, options?: RequestOptions<'json'>): (body: B) => ApiResource<D>;
export function useApi<B, D extends ADC<'text'> = ADC<'text'>>(method: 'post' | 'patch' | 'put', url: string, options: RequestOptions<'text'>): (body: B) => ApiResource<D>;
export function useApi<B, D>(method: 'post' | 'patch' | 'put', url: string, options?: RequestOptions<ARTF<D>>): (body: B) => ApiResource<D>;

export function useApi<B, D>(method: ApiMethod, url: string, options?: RequestOptions<ARTF<D>>): (body?: B) => ApiResource<D> {
  const { headers = {}, responseType = 'json' } = options ?? {};

  const _headers = useDeepMemo(headers);

  // Contexts
  const { request } = useApiRequest();

  // Callbacks
  return useCallback((body?: B) => request<ApiMethod, D>({
    method, url,
    headers: _headers,
    body,
    responseType: responseType as ARTF<D>,
  }), [request, method, url, _headers, responseType]);
}
