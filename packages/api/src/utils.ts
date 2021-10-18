// Types
export type Updator<R = unknown> = (data: R) => R;

// Utils
export function normalizeUpdator<R>(update: R | Updator<R>): Updator<R> {
  return typeof update === 'function' ? (update as Updator<R>) : () => update;
}