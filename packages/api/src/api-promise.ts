import axios, { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { APIState } from './types';

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

export function makeRequestApiPromise<R, E>(promise: Promise<AxiosResponse<R>>, source: CancelTokenSource, setState: Dispatch<SetStateAction<APIState<R, E>>>): ApiPromise<R> {
  return makeApiPromise(promise, () => source.cancel())
    .then((res): R => {
      setState({ loading: false, status: res.status, data: res.data });
      return res.data;
    })
    .catch((error) => {
      if (axios.isAxiosError(error)) {
        const { response } = error as AxiosError<E>;

        if (response) {
          setState({ loading: false, status: response.status, error: response.data });
          throw error;
        }
      }

      setState((old) => ({ ...old, loading: false }));
      throw error;
    });
}