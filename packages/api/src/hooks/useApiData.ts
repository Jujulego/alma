import { useWarehouse } from '@jujulego/alma-resources';
import { useId } from 'react';

import { ApiResource } from '../ApiResource';
import { useApiRequest, RequestOptions } from './useApiRequest';
import { ApiDataConstraint, ApiResponse, ApiResponseTypeFor } from '../types';

// Hook
export function useApiData<D extends ApiDataConstraint<'arraybuffer'> = ApiDataConstraint<'arraybuffer'>>(url: string, options?: RequestOptions<'arraybuffer'>): ApiResponse<D>;
export function useApiData<D extends ApiDataConstraint<'blob'> = ApiDataConstraint<'blob'>>(url: string, options?: RequestOptions<'blob'>): ApiResponse<D>;
export function useApiData<D extends ApiDataConstraint<'json'> = ApiDataConstraint<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResponse<D>;
export function useApiData<D extends ApiDataConstraint<'text'> = ApiDataConstraint<'text'>>(url: string, options?: RequestOptions<'text'>): ApiResponse<D>;
export function useApiData<D>(url: string, options?: RequestOptions<ApiResponseTypeFor<D>>): ApiResponse<D> {
  const wharehouse = useWarehouse();
  const api = useApiRequest();

  const id = `${useId()}:${url}`;
  let res = wharehouse.get(id) as ApiResource<D>;

  if (!res) {
    res = api.get<D>(url, options);
    wharehouse.set(id, res);
  }

  return res.read();
}
