import { createContext } from 'react';

import { ApiMethod, ApiRequest, ApiResponse } from '../types';
import { fetcher } from './fetcher';

// Types
export type ApiFetcher = <M extends ApiMethod, B, D>(req: ApiRequest<M, B>, signal: AbortSignal) => Promise<ApiResponse<D>>;

export interface ApiConfigContextProps {
  /**
   * Fetcher used to send requests.
   * Default implementation uses fetch.
   */
  fetcher: ApiFetcher;
}

// Context
export const ApiConfigContext = createContext<ApiConfigContextProps>({
  fetcher
});
