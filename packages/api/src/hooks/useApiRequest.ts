import { useCallback, useContext } from 'react';

import { ApiResource } from '../ApiResource';
import { ApiConfig, ApiConfigContext } from '../config';
import {
  ApiDataConstraint as ADC,
  ApiMethod,
  ApiRequest,
  ApiResponseTypeFor as ARTF,
} from '../types';

// Types
export interface UseApiRequestProps {
  // Generic method
  request<M extends ApiMethod, D = ADC<'arraybuffer'>>(req: ApiRequest<M, 'arraybuffer'>): ApiResource<D>;
  request<M extends ApiMethod, D = ADC<'blob'>>(req: ApiRequest<M, 'blob'>): ApiResource<D>;
  request<M extends ApiMethod, D = ADC<'text'>>(req: ApiRequest<M, 'text'>): ApiResource<D>;
  request<M extends ApiMethod, D>(req: ApiRequest<M, ARTF<D>>): ApiResource<D>;
}

// Hook
export function useApiRequest(config: Partial<ApiConfig> = {}): UseApiRequestProps {
  // Contexts
  const ctxConfig = useContext(ApiConfigContext);
  const { fetcher = ctxConfig.fetcher } = config;

  // Callback
  const request = useCallback(<M extends ApiMethod, D>(req: ApiRequest<M, ARTF<D>>): ApiResource<D> => {
    // Create resource
    const abort = new AbortController();
    return new ApiResource(fetcher<D>(req, abort.signal), abort);
  }, [fetcher]);

  return {
    request,
  };
}
