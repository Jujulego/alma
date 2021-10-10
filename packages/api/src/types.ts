// Utility types
export type Updator<R = unknown> = (data?: R) => R | undefined;
export type ApiParams = Record<string, unknown>;

export type CombineArg<A1, A2> = A1 extends void ? A2 : (A2 extends void ? A1 : A1 & A2)

export interface ApiState<R, E = unknown> {
  loading: boolean;
  cached: boolean;

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

// Utils
export function normalizeUpdator<R = unknown>(update: R | Updator<R>): Updator<R> {
  return typeof update === 'function' ? (update as Updator<R>) : () => update;
}