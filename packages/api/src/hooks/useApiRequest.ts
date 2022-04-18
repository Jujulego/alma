import { useCallback, useContext } from 'react';

import { ApiConfigContext } from '../ApiConfigContext';
import { ApiResource } from '../ApiResource';
import {
  ApiDataConstraint as ADC,
  ApiMethod,
  ApiRequest,
  ApiResponseTypeFor as ARTF,
} from '../types';

// Types
export interface UseApiRequestProps {
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
  };
}
