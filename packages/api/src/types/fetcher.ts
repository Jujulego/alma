import { ApiRequest } from './request';
import { ApiResponse } from './response';
import { ApiMethod, ApiResponseTypeFor } from './utils';

// Fetcher
export type ApiFetcher = <D>(req: ApiRequest<ApiMethod, ApiResponseTypeFor<D>>, signal: AbortSignal) => Promise<ApiResponse<D>>;
