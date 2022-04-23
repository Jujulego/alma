import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

import { ApiResource } from '../ApiResource';
import {
  ApiDataConstraint as ADC,
  ApiResponse,
  ApiResponseType,
  ApiResponseTypeFor as ARTF,
  EnforceRequestType as ERT,
  RequestOptions
} from '../types';
import { ApiConfig, ApiConfigContext } from '../config';
import { $get } from '../utils';
import { useApi } from './useApi';

// Types
export interface ApiDataOptions<RT extends ApiResponseType = ApiResponseType> extends RequestOptions<RT> {
  suspense?: boolean;
  config?: Partial<ApiConfig>;
}

export interface ApiDataOptionsEffect<RT extends ApiResponseType = ApiResponseType> extends ApiDataOptions<RT> {
  suspense: false;
}

export interface ApiDataOptionsSuspense<RT extends ApiResponseType = ApiResponseType> extends ApiDataOptions<RT> {
  suspense?: true;
}

export interface ApiDataResult<D> {
  isLoading: boolean;
  data: D;
  setData: Dispatch<SetStateAction<D>>;
}

// Hook
export function useApiData<D = ADC<'arraybuffer'>>(url: string, options: ERT<ApiDataOptionsEffect, 'arraybuffer'>): ApiDataResult<D | undefined>;
export function useApiData<D = ADC<'blob'>>(url: string, options: ERT<ApiDataOptionsEffect, 'blob'>): ApiDataResult<D | undefined>;
export function useApiData<D = ADC<'text'>>(url: string, options: ERT<ApiDataOptionsEffect, 'text'>): ApiDataResult<D | undefined>;
export function useApiData<D>(url: string, options: ApiDataOptionsEffect<ARTF<D>>): ApiDataResult<D | undefined>;

export function useApiData<D = ADC<'arraybuffer'>>(url: string, options: ERT<ApiDataOptionsSuspense, 'arraybuffer'>): ApiDataResult<D>;
export function useApiData<D = ADC<'blob'>>(url: string, options: ERT<ApiDataOptionsSuspense, 'blob'>): ApiDataResult<D>;
export function useApiData<D = ADC<'text'>>(url: string, options: ERT<ApiDataOptionsSuspense, 'text'>): ApiDataResult<D>;
export function useApiData<D>(url: string, options?: ApiDataOptionsSuspense<ARTF<D>>): ApiDataResult<D>;

export function useApiData<D>(url: string, options?: ApiDataOptions<ARTF<D>>): ApiDataResult<D | undefined>;

export function useApiData<D>(url: string, options: ApiDataOptions<ARTF<D>> = {}): ApiDataResult<D | undefined> {
  // Contexts
  const ctxConfig = useContext(ApiConfigContext);
  const send = useApi($get<D>(), url, options);

  // Options
  const { suspense = true, config: optConfig } = options ?? {};
  const { warehouse } = { ...ctxConfig, ...optConfig };

  // Resource
  const id = `useDataApi:${url}`;
  let res = warehouse.get<ApiResponse<D>, ApiResource<D>>(id);

  if (!res) {
    res = send();
    warehouse.set(id, res);
  }

  // State
  const [data, setData] = useState<D | undefined>(suspense ? res.read().data : undefined);

  // Effect
  useEffect(() => {
    if (res) {
      res.then(({ data }) => setData(data));

      return () => {
        setTimeout(() => res?.cancel(), 0);
      };
    }
  }, [res]);

  // Return
  return {
    isLoading: res.status === 'pending',
    data, setData,
  };
}
