import { useWarehouse } from '@jujulego/alma-resources';

import { ApiResource } from '../ApiResource';
import { useApiRequest, RequestOptions } from './useApiRequest';
import { ApiDataConstraint as ADC, ApiResponse, ApiResponseTypeFor as ARTF } from '../types';

// Hook
export function useApiData<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, options?: RequestOptions<'arraybuffer'>): ApiResponse<D>;
export function useApiData<D extends ADC<'blob'> = ADC<'blob'>>(url: string, options?: RequestOptions<'blob'>): ApiResponse<D>;
export function useApiData<D extends ADC<'json'> = ADC<'json'>>(url: string, options?: RequestOptions<'json'>): ApiResponse<D>;
export function useApiData<D extends ADC<'text'> = ADC<'text'>>(url: string, options?: RequestOptions<'text'>): ApiResponse<D>;
export function useApiData<D>(url: string, options?: RequestOptions<ARTF<D>>): ApiResponse<D> {
  const wharehouse = useWarehouse();
  const api = useApiRequest();

  const id = `useDataApi:${url}`;
  let res = wharehouse.get(id) as ApiResource<D>;

  if (!res) {
    res = api.get<D>(url, options);
    wharehouse.set(id, res);
  }

  return res.read();
}
