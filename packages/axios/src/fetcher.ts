import { ApiMethod, ApiRequest, ApiResponse, ApiResponseType, ApiRTConstraint } from '@jujulego/alma-api';
import axios from 'axios';

// Fetcher
export async function fetcher<M extends ApiMethod, B, D extends ApiRTConstraint[T], T extends ApiResponseType>(req: ApiRequest<M, T, B>, signal: AbortSignal): Promise<ApiResponse<T, D>> {
  return axios.request<D>({
    method: req.method,
    url: req.url,
    headers: req.headers,
    data: req.body,
    responseType: req.responseType,
    signal
  });
}
