import axios, { AxiosError, AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { ApiState } from '../types';
import { ApiPromise, makeApiPromise } from '../api-promise';

// Utils
export function makeRequestApiPromise<R, E>(promise: Promise<AxiosResponse<R>>, source: AbortController, setState: Dispatch<SetStateAction<ApiState<R, E>>>): ApiPromise<R> {
  return makeApiPromise(promise, () => source.abort())
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