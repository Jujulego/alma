import axios, { AxiosError, AxiosResponse, CancelTokenSource } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { APIState } from './types';

// Interface
export interface APIPromise<T> extends Promise<T> {
  cancel: () => void;
}

// Builder
export function makeAPIPromise<R, E>(promise: Promise<AxiosResponse<R>>, source: CancelTokenSource, setState: Dispatch<SetStateAction<APIState<R, E>>>): APIPromise<R> {
  const apiPromise = promise
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
    }) as APIPromise<R>;

  apiPromise.cancel = () => source.cancel();

  return apiPromise;
}