import { useCallback, useContext } from 'react';

import { ApiConfigContext } from '../ApiConfigContext';
import { ApiResource } from '../ApiResource';
import {
  ApiDataConstraint,
  ApiHeaders,
  ApiMethod,
  ApiRequest,
  ApiResponseType,
  ApiResponseTypeFor,
  RequestTypeOption
} from '../types';

// Types
export type RequestOptions<RT extends ApiResponseType> = RequestTypeOption<RT> & {
  headers?: ApiHeaders;
};

export interface UseApiRequestProps {
  // GET requests
  get<D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(url: string, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  get<D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(url: string, options: RequestOptions<'blob'>): ApiResource<D>;
  get<D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResource<D>;
  get<D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(url: string, options: RequestOptions<'text'>): ApiResource<D>;
  get<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>): ApiResource<D>;

  // HEAD requests
  head<D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(url: string, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  head<D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(url: string, options: RequestOptions<'blob'>): ApiResource<D>;
  head<D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResource<D>;
  head<D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(url: string, options: RequestOptions<'text'>): ApiResource<D>;
  head<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>): ApiResource<D>;

  // OPTIONS requests
  options<D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(url: string, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  options<D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(url: string, options: RequestOptions<'blob'>): ApiResource<D>;
  options<D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResource<D>;
  options<D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(url: string, options: RequestOptions<'text'>): ApiResource<D>;
  options<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>): ApiResource<D>;

  // DELETE requests
  delete<D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(url: string, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  delete<D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(url: string, options: RequestOptions<'blob'>): ApiResource<D>;
  delete<D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResource<D>;
  delete<D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(url: string, options: RequestOptions<'text'>): ApiResource<D>;
  delete<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>): ApiResource<D>;

  // POST requests
  post<B = unknown, D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(url: string, body: B, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  post<B = unknown, D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(url: string, body: B, options: RequestOptions<'blob'>): ApiResource<D>;
  post<B = unknown, D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(url: string, body: B, options?: RequestOptions<'json'>): ApiResource<D>;
  post<B = unknown, D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(url: string, body: B, options: RequestOptions<'text'>): ApiResource<D>;
  post<B, D>(url: string, body: B, options?: RequestOptions<ApiResponseTypeFor<D>>): ApiResource<D>;

  // PATCH requests
  patch<B = unknown, D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(url: string, body: B, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  patch<B = unknown, D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(url: string, body: B, options: RequestOptions<'blob'>): ApiResource<D>;
  patch<B = unknown, D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(url: string, body: B, options?: RequestOptions<'json'>): ApiResource<D>;
  patch<B = unknown, D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(url: string, body: B, options: RequestOptions<'text'>): ApiResource<D>;
  patch<B, D>(url: string, body: B, options?: RequestOptions<ApiResponseTypeFor<D>>): ApiResource<D>;

  // PUT requests
  put<B = unknown, D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(url: string, body: B, options: RequestOptions<'arraybuffer'>): ApiResource<D>;
  put<B = unknown, D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(url: string, body: B, options: RequestOptions<'blob'>): ApiResource<D>;
  put<B = unknown, D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(url: string, body: B, options?: RequestOptions<'json'>): ApiResource<D>;
  put<B = unknown, D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(url: string, body: B, options: RequestOptions<'text'>): ApiResource<D>;
  put<B, D>(url: string, body: B, options?: RequestOptions<ApiResponseTypeFor<D>>): ApiResource<D>;

  // Generic method
  request<M extends ApiMethod, D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(req: ApiRequest<M, 'arraybuffer'>): ApiResource<D>;
  request<M extends ApiMethod, D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(req: ApiRequest<M, 'blob'>): ApiResource<D>;
  request<M extends ApiMethod, D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(req: ApiRequest<M, 'json'>): ApiResource<D>;
  request<M extends ApiMethod, D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(req: ApiRequest<M, 'text'>): ApiResource<D>;
  request<M extends ApiMethod, D>(req: ApiRequest<M, ApiResponseTypeFor<D>>): ApiResource<D>;
}

// Hook
export function useApiRequest(): UseApiRequestProps {
  // Contexts
  const { fetcher } = useContext(ApiConfigContext);

  // Callback
  const request = useCallback(<M extends ApiMethod, D>(req: ApiRequest<M, ApiResponseTypeFor<D>>): ApiResource<D> => {
    // Create resource
    const abort = new AbortController();
    return new ApiResource(fetcher<D>(req, abort.signal), abort);
  }, [fetcher]);

  return {
    request,
    get: useCallback(<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'get', D>({ method: 'get', url, headers, responseType: responseType as ApiResponseTypeFor<D> });
    }, [request]),
    head: useCallback(<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'head', D>({ method: 'head', url, headers, responseType: responseType as ApiResponseTypeFor<D> });
    }, [request]),
    options: useCallback(<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'options', D>({ method: 'options', url, headers, responseType: responseType as ApiResponseTypeFor<D> });
    }, [request]),
    delete: useCallback(<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'delete', D>({ method: 'delete', url, headers, responseType: responseType as ApiResponseTypeFor<D> });
    }, [request]),
    post: useCallback(<B, D>(url: string, body: B, options?: RequestOptions<ApiResponseTypeFor<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'post', D>({ method: 'post', url, headers, body, responseType: responseType as ApiResponseTypeFor<D> });
    }, [request]),
    patch: useCallback(<B, D>(url: string, body: B, options?: RequestOptions<ApiResponseTypeFor<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'patch', D>({ method: 'patch', url, headers, body, responseType: responseType as ApiResponseTypeFor<D> });
    }, [request]),
    put: useCallback(<B, D>(url: string, body: B, options?: RequestOptions<ApiResponseTypeFor<D>>) => {
      const { headers = {}, responseType = 'json' } = options ?? {};
      return request<'put', D>({ method: 'put', url, headers, body, responseType: responseType as ApiResponseTypeFor<D> });
    }, [request]),
  };
}
