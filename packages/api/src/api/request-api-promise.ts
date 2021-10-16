import axios, { AxiosError, AxiosResponse } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { ApiResult, ApiState } from '../types';
import { ApiPromise, makeApiPromise } from '../api-promise';

// Utils
export function makeRequestApiPromise<R, E = unknown>(promise: Promise<AxiosResponse<R>>, source: AbortController, setState: Dispatch<SetStateAction<ApiState>>): ApiPromise<ApiResult<R, E>> {
  return makeApiPromise(promise, () => source.abort())
    .then((res): ApiResult<R, E> => {
      setState({ loading: false });
      return { status: res.status, data: res.data };
    })
    .catch((error) => {
      setState({ loading: false });

      if (axios.isAxiosError(error)) {
        const { response } = error as AxiosError<E>;

        if (response) {
          return { status: response.status, error: response.data };
        }
      }

      throw error;
    });
}