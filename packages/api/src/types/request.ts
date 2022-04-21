import { ApiHeaders, ApiMethod, ApiResponseType } from './utils';

// Utils
export interface ApiMethodBody<B> {
  get: { body?: B };
  head: { body?: B };
  options: { body?: B };
  delete: { body?: B };
  post: { body: B };
  patch: { body: B };
  put: { body: B };
}

// Request
export type ApiRequest<M extends ApiMethod = ApiMethod, RT extends ApiResponseType = ApiResponseType, B = unknown> = ApiMethodBody<B>[M] & {
  /**
   * Request HTTP method
   */
  method: M;

  /**
   * Request url
   */
  url: string;

  /**
   * Request headers
   */
  headers: ApiHeaders;

  /**
   * Awaited response type
   */
  responseType: RT;
}

// Options
export interface RequestOptions<RT extends ApiResponseType = ApiResponseType> {
  headers?: ApiHeaders;
  responseType?: RT;
}

export type EnforceRequestType<O extends RequestOptions, RT extends ApiResponseType> = O & {
  responseType: RT;
}
