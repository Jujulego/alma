import { useResourceStatus, useWarehouse } from '@jujulego/alma-resources';
import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useState } from 'react';

import { ApiResource } from '../ApiResource';
import { useApiRequest, RequestOptions } from './useApiRequest';
import { ApiDataConstraint as ADC, ApiResponse, ApiResponseType, ApiResponseTypeFor as ARTF } from '../types';

// Types
export type ApiDataOptionsEffect<RT extends ApiResponseType> = RequestOptions<RT> & {
  suspense: false;
}

export type ApiDataOptionsSuspense<RT extends ApiResponseType> = RequestOptions<RT> & {
  suspense?: true;
}

export type ApiDataOptions<RT extends ApiResponseType> = ApiDataOptionsEffect<RT> | ApiDataOptionsSuspense<RT>;

export interface ApiDataResultEffect<D> {
  isLoading: boolean;
  data?: D;
  setData: Dispatch<SetStateAction<D | undefined>>;
}

export interface ApiDataResultSuspense<D> {
  isLoading: boolean;
  data: D;
  setData: Dispatch<SetStateAction<D>>;
}

export type ApiDataResult<D> = ApiDataResultEffect<D> | ApiDataResultSuspense<D>;

// Hook
export function useApiData<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, options: ApiDataOptionsEffect<'arraybuffer'>): ApiDataResultEffect<D>;
export function useApiData<D extends ADC<'blob'> = ADC<'blob'>>(url: string, options: ApiDataOptionsEffect<'blob'>): ApiDataResultEffect<D>;
export function useApiData<D extends ADC<'json'> = ADC<'json'>>(url: string, options: ApiDataOptionsEffect<'json'>): ApiDataResultEffect<D>;
export function useApiData<D extends ADC<'text'> = ADC<'text'>>(url: string, options: ApiDataOptionsEffect<'text'>): ApiDataResultEffect<D>;
export function useApiData<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>>(url: string, options: ApiDataOptionsSuspense<'arraybuffer'>): ApiDataResultSuspense<D>;
export function useApiData<D extends ADC<'blob'> = ADC<'blob'>>(url: string, options: ApiDataOptionsSuspense<'blob'>): ApiDataResultSuspense<D>;
export function useApiData<D extends ADC<'json'> = ADC<'json'>>(url: string, options?: ApiDataOptionsSuspense<'json'>): ApiDataResultSuspense<D>;
export function useApiData<D extends ADC<'text'> = ADC<'text'>>(url: string, options: ApiDataOptionsSuspense<'text'>): ApiDataResultSuspense<D>;
export function useApiData<D>(url: string, options?: ApiDataOptions<ARTF<D>>): ApiDataResult<D> {
  const suspense = options?.suspense ?? true;

  // Contexts
  const warehouse = useWarehouse();
  const api = useApiRequest();

  // Resource
  const id = `useDataApi:${url}`;
  let res = warehouse.get<ApiResponse<D>, ApiResource<D>>(id);

  if (!res) {
    res = api.get<D>(url, options);
    warehouse.set(id, res);
  }

  // State
  const [data, setData] = useState<D | undefined>(suspense ? res.read().data : undefined);

  // Effect
  useEffect(() => {
    const res = warehouse.get<ApiResponse<D>, ApiResource<D>>(id);

    if (res) {
      res.then(({ data }) => setData(data));
      //return () => res.cancel();
    }
  }, [warehouse, id]);

  // Return
  return {
    isLoading: res.status === 'pending',
    data, setData,
  };
}
