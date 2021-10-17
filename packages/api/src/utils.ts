// Types
export type CombineArg<A1, A2> = A1 extends void ? A2 : (A2 extends void ? A1 : A1 & A2)
export type Updator<R = unknown> = (data: R) => R;

// Utils
export function normalizeUpdator<R>(update: R | Updator<R>): Updator<R> {
  return typeof update === 'function' ? (update as Updator<R>) : () => update;
}