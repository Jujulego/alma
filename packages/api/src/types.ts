// Utility types
export type Updator<R> = (data?: R) => R;
export type APIParams = Record<string, unknown>;

export interface APIState<R, E = unknown> {
  loading: boolean;

  /**
   * Status of the last response
   */
  status?: number;

  /**
   * Result of the request if it was successful
   */
  data?: R;

  /**
   * Result of the request if it was errored
   */
  error?: E;
}
