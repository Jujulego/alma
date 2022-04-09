import { useCallback, useContext } from 'react';

import { ApiConfigContext } from '../ApiConfigContext';
import { ApiResource } from '../ApiResource';
import { ApiDataConstraint, ApiMethod, ApiRequest, ApiResponseTypeFor } from '../types';

// Types
export interface UseApiRequestProps {
  request<M extends ApiMethod>(req: ApiRequest<M, 'arraybuffer'>): ApiResource<ApiDataConstraint<'arraybuffer'>>;
  request<M extends ApiMethod>(req: ApiRequest<M, 'blob'>): ApiResource<ApiDataConstraint<'blob'>>;
  request<M extends ApiMethod>(req: ApiRequest<M, 'json'>): ApiResource<ApiDataConstraint<'json'>>;
  request<M extends ApiMethod>(req: ApiRequest<M, 'text'>): ApiResource<ApiDataConstraint<'text'>>;
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

  return { request };
}
