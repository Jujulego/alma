import { ApiHeaders, ApiRTConstraint } from './utils';
import { ApiRequest } from './request';

// Utils
export type ApiResponseFor<Rq extends ApiRequest, D extends ApiRTConstraint[Rq['responseType']] = ApiRTConstraint[Rq['responseType']]> = ApiResponse<D>;

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
