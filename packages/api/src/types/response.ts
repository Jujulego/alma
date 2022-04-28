import { AbortResource } from '@jujulego/alma-resources';

import { ApiHeaders, ApiDataConstraint } from './utils';
import { ApiRequest } from './request';

// Utils
export type ApiResource<D> = AbortResource<ApiResponse<D>>;
export type ApiResponseFor<Rq extends ApiRequest, D extends ApiDataConstraint<Rq['responseType']> = ApiDataConstraint<Rq['responseType']>> = ApiResponse<D>;

// Response
export interface ApiResponse<D> {
  /**
   * Response status
   */
  status: number;

  /**
   * Response status text
   */
  statusText: string;

  /**
   * Response headers
   */
  headers: ApiHeaders;

  /**
   * Response content
   */
  data: D;
}
