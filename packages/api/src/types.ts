// Types
export type ApiMethod = 'get' | 'head' | 'options' | 'delete' | 'post' | 'patch' | 'put';
export type ApiHeaders = Record<string, string>;
export type ApiResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

export type ApiFetcher = <M extends ApiMethod, T extends ApiResponseType, B, D extends ApiRTConstraint[T]>(req: ApiRequest<M, T, B>, signal: AbortSignal) => Promise<ApiResponse<T, D>>;

// - request
export interface ApiMethodBody<B> {
  get: { body?: B };
  head: { body?: B };
  options: { body?: B };
  delete: { body?: B };
  post: { body: B };
  patch: { body: B };
  put: { body: B };
}

export interface ApiRTConstraint {
  arraybuffer: ArrayBuffer;
  blob: Blob;
  json: unknown;
  text: string;
}

export type ApiRequest<M extends ApiMethod, T extends ApiResponseType, B = unknown> = ApiMethodBody<B>[M] & {
  /**
   * Request method
   */
  method: M;

  /**
   * Response type
   */
  responseType: T;

  /**
   * Request url
   */
  url: string;

  /**
   * Request headers
   */
  headers: ApiHeaders;
}

// - response
export interface ApiResponse<T extends ApiResponseType, D extends ApiRTConstraint[T] = ApiRTConstraint[T]> {
  /**
   * Response status
   */
  status: number;

  /**
   * Response headers
   */
  headers: ApiHeaders;

  /**
   * Response body
   */
  data: D;
}

// - hooks
export interface ApiLoadableHookConfig<T extends ApiResponseType> {
  /**
   * Default Headers of the request (could be overridden by send call)
   */
  headers?: ApiHeaders;

  /**
   * Response type
   * @default 'json'
   */
  responseType?: T;
}
