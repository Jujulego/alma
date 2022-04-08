import { ApiRequest } from './request';
import { ApiResponseFor } from './response';

// Fetcher
export type ApiFetcher = <Rq extends ApiRequest>(req: Rq, signal: AbortSignal) => Promise<ApiResponseFor<Rq>>;
