import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import {
  ApiGetState,
  useApiDelete,
  useApiGet,
  useApiHead,
  useApiOptions,
  useApiPatch,
  useApiPost, useApiPut
} from './api';
import { ApiPromise } from './api-promise';
import { ApiParams, ApiResult } from './types';

// Constants
const API_GET_HOOKS = {
  get: useApiGet,
  head: useApiHead,
  options: useApiOptions,
  delete: useApiDelete,
};

const API_POST_HOOKS = {
  post: useApiPost,
  patch: useApiPatch,
  put: useApiPut,
};

// Types
export type ApiUrlBuilder<A> = (args: A) => string;
export type ApiMerge<S, R> = (state: S | undefined, res: R | undefined) => S | undefined;

export type ApiStateGetMethod<N extends string, RM, PM extends ApiParams> = {
  [key in N]: (params?: PM) => ApiPromise<ApiResult<RM>>
}

export type ApiStatePostMethod<N extends string, BM, RM, PM extends ApiParams> = {
  [key in N]: (body: BM, params?: PM) => ApiPromise<ApiResult<RM>>
}

export type ApiHook<R, P extends ApiParams, A, S extends ApiGetState<R, P>> = ((arg: A, params?: P) => S) & ApiHookMethods<R, P, A, S>;

export interface ApiHookMethods<R, P extends ApiParams, A, S extends ApiGetState<R, P>> {
  get<N extends string, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStateGetMethod<N, RM, PM>>;
  head<N extends string, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStateGetMethod<N, RM, PM>>;
  options<N extends string, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStateGetMethod<N, RM, PM>>;
  delete<N extends string, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStateGetMethod<N, RM, PM>>;
  patch<N extends string, BM, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>>;
  post<N extends string, BM, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>>;
  put<N extends string, BM, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>>;
}

// Utils
function hookMethods<R, P extends ApiParams, A, S extends ApiGetState<R, P>>(url: ApiUrlBuilder<A>): ApiHookMethods<R, P, A, S> {
  return {
    get<N extends string, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
      return addGetCall<N, R, RM, P, PM, A, S>(name, 'get', url, this, merge);
    },
    head<N extends string, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
      return addGetCall<N, R, RM, P, PM, A, S>(name, 'head', url, this, merge);
    },
    options<N extends string, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
      return addGetCall<N, R, RM, P, PM, A, S>(name, 'options', url, this, merge);
    },
    delete<N extends string, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
      return addGetCall<N, R, RM, P, PM, A, S>(name, 'delete', url, this, merge);
    },
    patch<N extends string, BM, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
      return addPostCall<N, BM, R, RM, P, PM, A, S>(name, 'patch', url, this, merge);
    },
    post<N extends string, BM, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
      return addPostCall<N, BM, R, RM, P, PM, A, S>(name, 'post', url, this, merge);
    },
    put<N extends string, BM, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
      return addPostCall<N, BM, R, RM, P, PM, A, S>(name, 'put', url, this, merge);
    }
  };
}

// Hook modifier
function addGetCall<N extends string, R, RM, P extends ApiParams, PM extends ApiParams, A, S extends ApiGetState<R, P>>(name: N, method: keyof typeof API_GET_HOOKS, builder: ApiUrlBuilder<A>, wrapped: ApiHook<R, P, A, S>, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStateGetMethod<N, RM, PM>> {
  // Hook
  function useApiResource(args: A, params?: P): S & ApiStateGetMethod<N, RM, PM> {
    // Url
    const sargs = useDeepMemo(args);
    const url = useMemo(() => builder(sargs), [sargs]);

    // Api
    const { send } = API_GET_HOOKS[method]<RM, PM>(url, undefined, { load: false });
    const all = wrapped(args, params);

    // Result
    const { update } = all;

    return Object.assign(all, {
      [name]: useCallback((params?: PM) => {
        return send(params).then((res) => {
          update(old => merge(old, res.data));
          return res;
        });
      }, [send, update]),
    } as ApiStateGetMethod<N, RM, PM>);
  }

  return Object.assign(useApiResource, hookMethods<R, P, A, S & ApiStateGetMethod<N, RM, PM>>(builder));
}

function addPostCall<N extends string, BM, R, RM, P extends ApiParams, PM extends ApiParams, A, S extends ApiGetState<R, P>>(name: N, method: keyof typeof API_POST_HOOKS, builder: ApiUrlBuilder<A>, wrapped: ApiHook<R, P, A, S>, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>> {
  // Hook
  function useApiResource(args: A, params?: P): S & ApiStatePostMethod<N, BM, RM, PM> {
    // Url
    const sargs = useDeepMemo(args);
    const url = useMemo(() => builder(sargs), [sargs]);

    // Api
    const { send } = API_POST_HOOKS[method]<BM, RM, PM>(url);
    const all = wrapped(args, params);

    // Result
    const { update } = all;

    return Object.assign(all, {
      [name]: useCallback((body: BM, params?: PM) => {
        return send(body, params).then((res) => {
          update(old => merge(old, res.data));
          return res;
        });
      }, [send, update]),
    } as ApiStatePostMethod<N, BM, RM, PM>);
  }

  return Object.assign(useApiResource, hookMethods<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>>(builder));
}

// Hook builder
export function apiResource<R, P extends ApiParams, A = void>(url: string | ApiUrlBuilder<A>): ApiHook<R, P, A, ApiGetState<R, P>> {
  const builder = typeof url === 'string' ? () => url : url;

  // Hook
  function useApiResource(args: A, params?: P): ApiGetState<R, P> {
    // Url
    const sargs = useDeepMemo(args);
    const url = useMemo(() => builder(sargs), [sargs]);

    // Api
    return useApiGet<R, P>(url, params);
  }

  return Object.assign(useApiResource, hookMethods<R, P, A, ApiGetState<R, P>>(builder));
}
