// Utility types
export type Updator<R> = (data?: R) => R;
export type APIParams = Record<string, unknown>;

export interface APIState<R, E = unknown> {
  loading: boolean;
  status?: number;
  data?: R;
  error?: E;
}
