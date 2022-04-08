// Interface
export type ApiPromiseCallback<A, R> = ((arg: A) => R | PromiseLike<R>) | undefined | null;

export interface ApiPromise<T> extends Promise<T> {
  cancel: () => void;
  then<R1 = T, R2 = never>(onfulfilled?: ApiPromiseCallback<T, R1>, onrejected?: ApiPromiseCallback<T, R2>): ApiPromise<R1 | R2>;
  catch<R = never>(onrejected?: ApiPromiseCallback<unknown, R>): ApiPromise<T | R>;
}

// Builder
export function makeApiPromise<T>(prom: Promise<T>, cancel: () => void): ApiPromise<T> {
  const api = prom as ApiPromise<T>;
  api.cancel = cancel;

  const oldThen = prom.then;
  api.then = (...args) => makeApiPromise(oldThen.call(api, ...args), cancel);

  const oldCatch = prom.catch;
  api.catch = (...args) => makeApiPromise(oldCatch.call(api, ...args), cancel);

  return api;
}

