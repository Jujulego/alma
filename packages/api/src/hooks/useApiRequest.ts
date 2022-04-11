import { useCallback, useContext } from 'react';

import { ApiConfigContext } from '../ApiConfigContext';
import { ApiResource } from '../ApiResource';
import {
  ApiDataConstraint as ADC,
  ApiHeaders,
  ApiMethod,
  ApiRequest,
  ApiResponseType,
  ApiResponseTypeFor as ARTF,
  RequestTypeOption
} from '../types';

// Types
export type RequestOptions<RT extends ApiResponseType> = RequestTypeOption<RT> & {
  headers?: ApiHeaders;
};

export interface UseApiRequestProps {
  // GET requests
  get<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  get<D extends ADC<'blob'> = ADC<'blob'>>(url: string, options: RequestOptions<'blob'>): ApiResource<D>;
  get<D extends ADC<'json'> = ADC<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResource<D>;
  get<D extends ADC<'text'> = ADC<'text'>>(url: string, options: RequestOptions<'text'>): ApiResource<D>;
  get<D>(url: string, options?: RequestOptions<ARTF<D>>): ApiResource<D>;

  // HEAD requests
  head<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  head<D extends ADC<'blob'> = ADC<'blob'>>(url: string, options: RequestOptions<'blob'>): ApiResource<D>;
  head<D extends ADC<'json'> = ADC<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResource<D>;
  head<D extends ADC<'text'> = ADC<'text'>>(url: string, options: RequestOptions<'text'>): ApiResource<D>;
  head<D>(url: string, options?: RequestOptions<ARTF<D>>): ApiResource<D>;

  // OPTIONS requests
  options<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  options<D extends ADC<'blob'> = ADC<'blob'>>(url: string, options: RequestOptions<'blob'>): ApiResource<D>;
  options<D extends ADC<'json'> = ADC<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResource<D>;
  options<D extends ADC<'text'> = ADC<'text'>>(url: string, options: RequestOptions<'text'>): ApiResource<D>;
  options<D>(url: string, options?: RequestOptions<ARTF<D>>): ApiResource<D>;

  // DELETE requests
  delete<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  delete<D extends ADC<'blob'> = ADC<'blob'>>(url: string, options: RequestOptions<'blob'>): ApiResource<D>;
  delete<D extends ADC<'json'> = ADC<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResource<D>;
  delete<D extends ADC<'text'> = ADC<'text'>>(url: string, options: RequestOptions<'text'>): ApiResource<D>;
  delete<D>(url: string, options?: RequestOptions<ARTF<D>>): ApiResource<D>;

  // POST requests
  post<B = unknown, D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, body: B, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  post<B = unknown, D extends ADC<'blob'> = ADC<'blob'>>(url: string, body: B, options: RequestOptions<'blob'>): ApiResource<D>;
  post<B = unknown, D extends ADC<'json'> = ADC<'json'>>(url: string, body: B, options?: RequestOptions<'json'>): ApiResource<D>;
  post<B = unknown, D extends ADC<'text'> = ADC<'text'>>(url: string, body: B, options: RequestOptions<'text'>): ApiResource<D>;
  post<B, D>(url: string, body: B, options?: RequestOptions<ARTF<D>>): ApiResource<D>;

  // PATCH requests
  patch<B = unknown, D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, body: B, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  patch<B = unknown, D extends ADC<'blob'> = ADC<'blob'>>(url: string, body: B, options: RequestOptions<'blob'>): ApiResource<D>;
  patch<B = unknown, D extends ADC<'json'> = ADC<'json'>>(url: string, body: B, options?: RequestOptions<'json'>): ApiResource<D>;
  patch<B = unknown, D extends ADC<'text'> = ADC<'text'>>(url: string, body: B, options: RequestOptions<'text'>): ApiResource<D>;
  patch<B, D>(url: string, body: B, options?: RequestOptions<ARTF<D>>): ApiResource<D>;

  // PUT requests
  put<B = unknown, D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, body: B, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  put<B = unknown, D extends ADC<'blob'> = ADC<'blob'>>(url: string, body: B, options: RequestOptions<'blob'>): ApiResource<D>;
  put<B = unknown, D extends ADC<'json'> = ADC<'json'>>(url: string, body: B, options?: RequestOptions<'json'>): ApiResource<D>;
  put<B = unknown, D extends ADC<'text'> = ADC<'text'>>(url: string, body: B, options: RequestOptions<'text'>): ApiResource<D>;
  put<B, D>(url: string, body: B, options?: RequestOptions<ARTF<D>>): ApiResource<D>;

  // Generic method
  request<M extends ApiMethod, D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(req: ApiRequest<M, 'arraybuffer'>): ApiResource<D>;
  request<M extends ApiMethod, D extends ADC<'blob'> = ADC<'blob'>>(req: ApiRequest<M, 'blob'>): ApiResource<D>;
  request<M extends ApiMethod, D extends ADC<'json'> = ADC<'json'>>(req: ApiRequest<M, 'json'>): ApiResource<D>;
  request<M extends ApiMethod, D extends ADC<'text'> = ADC<'text'>>(req: ApiRequest<M, 'text'>): ApiResource<D>;
  request<M extends ApiMethod, D>(req: ApiRequest<M, ARTF<D>>): ApiResource<D>;
}

// Hook
export function useApiRequest(): UseApiRequestProps {
  // Contexts
  const { fetcher } = useContext(ApiConfigContext);

  // Callback
  const request = useCallback(<M extends ApiMethod, D>(req: ApiRequest<M, ARTF<D>>): ApiResource<D> => {
    // Create resource
    const abort = new AbortController();
    return new ApiResource(fetcher<D>(req, abort.signal), abort);
  }, [fetcher]);

  return {
    request,
    get: useCallback(<D>(url: string, options?: RequestOptions<ARTF<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'get', D>({ method: 'get', url, headers, responseType: responseType as ARTF<D> });
    }, [request]),
    head: useCallback(<D>(url: string, options?: RequestOptions<ARTF<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'head', D>({ method: 'head', url, headers, responseType: responseType as ARTF<D> });
    }, [request]),
    options: useCallback(<D>(url: string, options?: RequestOptions<ARTF<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'options', D>({ method: 'options', url, headers, responseType: responseType as ARTF<D> });
    }, [request]),
    delete: useCallback(<D>(url: string, options?: RequestOptions<ARTF<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'delete', D>({ method: 'delete', url, headers, responseType: responseType as ARTF<D> });
    }, [request]),
    post: useCallback(<B, D>(url: string, body: B, options?: RequestOptions<ARTF<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'post', D>({ method: 'post', url, headers, body, responseType: responseType as ARTF<D> });
    }, [request]),
    patch: useCallback(<B, D>(url: string, body: B, options?: RequestOptions<ARTF<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'patch', D>({ method: 'patch', url, headers, body, responseType: responseType as ARTF<D> });
    }, [request]),
    put: useCallback(<B, D>(url: string, body: B, options?: RequestOptions<ARTF<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'put', D>({ method: 'put', url, headers, body, responseType: responseType as ARTF<D> });
    }, [request]),
  };
}
