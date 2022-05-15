import { ApiMethod, ApiRequest, ApiResponse, ApiResponseTypeFor } from '@jujulego/alma-api';
import axios from 'axios';

// Fetcher
export async function fetcher<D>(req: ApiRequest<ApiMethod, ApiResponseTypeFor<D>>, signal: AbortSignal): Promise<ApiResponse<D>> {
  return axios.request<D>({
    method: req.method,
    url: req.url,
    params: req.query,
    headers: req.headers,
    data: req.body,
    responseType: req.responseType,
    signal
  });
}
