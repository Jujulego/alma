// Types
export type ApiMethod = 'get' | 'head' | 'options' | 'delete' | 'post' | 'patch' | 'put';
export type ApiParams = Record<string, unknown>;
export type ApiHeaders = Record<string, string>;

// - request
interface ApiMethodBody<B> {
  get: { body?: B },
  head: { body?: B },
  options: { body?: B },
  delete: { body?: B },
  post: { body: B },
  patch: { body: B },
  put: { body: B },
}

export type ApiRequest<M extends ApiMethod, B = unknown> = ApiMethodBody<B>[M] & {
  /**
   * Request method
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
}

// - response
export interface ApiResponse<D = unknown> {
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
