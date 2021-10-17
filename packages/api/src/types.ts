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

// ====================== OLD ======================
export type CombineArg<A1, A2> = A1 extends void ? A2 : (A2 extends void ? A1 : A1 & A2)

export interface ApiState {
  loading: boolean;
}

export interface ApiResult<R, E = unknown> {
  /**
   * Status of the last response
   */
  status: number;

  /**
   * Result of the request if it was successful
   */
  data?: R;

  /**
   * Result of the request if it was errored
   */
  error?: E;
}
